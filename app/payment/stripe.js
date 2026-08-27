import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform, Image } from 'react-native';
import { colors } from '../../utils/theme';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useStripe } from '@stripe/stripe-react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { findOrder, isPaidLikeOrder } from '../../services/ordersRepository';
import AUTH_CONFIG from '../../config/auth';
import { useLocalization } from '../../contexts/LocalizationContext';
import { createLogger } from '../../utils/logger';
import { getJson } from '../../services/httpClient';
import OrderSuccessScreen from '../../components/OrderSuccessScreen';
import T from '../../utils/typography';
import { EMPTY_UNI_IMAGE } from '../../utils/assets';
import { startOrderActivityForNewOrder } from '../../utils/orderLiveActivity';
import { saveLiveActivityToken } from '../../services/pushNotificationsService';

const log = createLogger('StripePayment');

const extractStripeSessionIdFromUrl = (url) => {
  const u = String(url || '');
  // Stripe Checkout "session.url" commonly looks like:
  // https://checkout.stripe.com/c/pay/cs_test_...
  const m = u.match(/\/c\/pay\/(cs_[A-Za-z0-9_]+)/);
  return m?.[1] || '';
};

const getPaymentStatusLabel = (status, t) => {
  const key = String(status || '').trim().toLowerCase();
  const map = {
    pending: 'payment.statusPending',
    processing: 'payment.statusProcessing',
    paid: 'payment.statusPaid',
    succeeded: 'payment.statusPaid',
    completed: 'payment.statusCompleted',
    failed: 'payment.statusFailed',
    cancelled: 'payment.statusCancelled',
    canceled: 'payment.statusCancelled',
    refunded: 'payment.statusRefunded',
  };
  return map[key] ? t(map[key]) : (status || t('payment.statusPending'));
};

export default function StripePaymentScreen() {
  const { user } = useAuth();
  const { clearCart } = useCart();
  const token = user?.token || user?.accessToken || '';
  const { t, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const params = useLocalSearchParams();
  const clientSecret = String(params.clientSecret || '');
  const paymentUrl = String(params.paymentUrl || '');
  const orderId = params.orderId ? String(params.orderId) : '';
  const orderNumber = params.orderNumber ? String(params.orderNumber) : '';
  const fromOrders = String(params.fromOrders || '') === '1';

  // Native Stripe Payment Sheet when we have a PaymentIntent client secret
  // (new in-app checkout). Falls back to the hosted browser flow when only a
  // paymentUrl is provided (e.g. retrying an older pending order).
  const useNativeSheet = !!clientSecret;

  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);
  const [paid, setPaid] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [errorText, setErrorText] = useState('');
  const sheetReadyRef = useRef(false);
  // Synchronous mirror of `busy`. State cannot gate a double-tap because it
  // only takes effect on the next render; this is readable in the same tick.
  const busyRef = useRef(false);
  const autoStartedRef = useRef(false);

  const canCheck = !!token && (!!orderId || !!orderNumber);

  const checkPayment = useCallback(async (silent = false) => {
    if (!canCheck) return false;
    if (!silent) setChecking(true);
    try {
      let match = await findOrder(token, orderId || orderNumber);

      if (!match) {
        if (!silent) {
          setStatusText(t('payment.couldNotFindOrderYet'));
          setPaid(false);
        }
        return false;
      }

      // If not paid yet, optionally trigger a server-side Stripe refresh
      // (helps when the webhook is briefly delayed). Works for both the hosted
      // session (cs_...) and PaymentIntent (the status route handles both).
      if (!isPaidLikeOrder(match)) {
        const sessionId = extractStripeSessionIdFromUrl(paymentUrl);
        // PaymentIntent id is the part of the client secret before "_secret_".
        // Only forward it when it is actually a PaymentIntent id — other intent
        // formats (e.g. seti_) would silently fail the status refresh.
        const rawIntentId = clientSecret ? String(clientSecret).split('_secret_')[0] : '';
        const paymentIntentId = rawIntentId.startsWith('pi_') ? rawIntentId : '';
        try {
          const apiRoot = String(AUTH_CONFIG.API_BASE_URL || '').replace(/\/mobile\/?$/, '');
          let statusUrl = '';
          if (sessionId) {
            statusUrl = `${apiRoot}/stripe/payment-status?session_id=${encodeURIComponent(sessionId)}`;
          } else if (paymentIntentId) {
            statusUrl = `${apiRoot}/stripe/payment-status?payment_intent=${encodeURIComponent(paymentIntentId)}${orderId ? `&order_id=${encodeURIComponent(orderId)}` : ''}`;
          }
          if (statusUrl) {
            await getJson(statusUrl, { authenticated: true, token, headers: { token } }).catch(() => null);
          }
        } catch {
          // ignore
        }
        match = (await findOrder(token, orderId || orderNumber).catch(() => null)) || match;
      }

      const s = String(match?.status || '');
      const ps = String(match?.paymentStatus || match?.payment_status || '');
      const label = getPaymentStatusLabel(ps || s, t);
      setStatusText(t('payment.currentStatus', { status: label }));

      const isPaid = isPaidLikeOrder(match);
      if (isPaid) setPaid(true);
      return isPaid;
    } catch (e) {
      log.warn('Payment status check failed', e?.message || e);
      if (!silent) setStatusText(t('payment.checkStatusFailed'));
      return false;
    } finally {
      if (!silent) setChecking(false);
    }
  }, [canCheck, orderId, orderNumber, token, paymentUrl, clientSecret, t]);

  // --- Native Stripe Payment Sheet -----------------------------------------
  const payWithSheet = useCallback(async () => {
    if (!clientSecret) return;
    // `disabled={busy}` cannot hold this on its own: the screen auto-starts the
    // sheet on mount, and `busy` is still false until that state commits, so the
    // button is live for a frame. Two callers would both find sheetReadyRef
    // false (it is only set after the await) and initialise the same
    // PaymentIntent twice, which Stripe rejects. A ref flips synchronously.
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setErrorText('');
    try {
      if (!sheetReadyRef.current) {
        const { error: initError } = await initPaymentSheet({
          merchantDisplayName: AUTH_CONFIG.STRIPE.merchantDisplayName,
          paymentIntentClientSecret: clientSecret,
          // iOS native Apple Pay overlay
          applePay: { merchantCountryCode: AUTH_CONFIG.STRIPE.merchantCountryCode },
          // Android native Google Pay
          googlePay: {
            merchantCountryCode: AUTH_CONFIG.STRIPE.merchantCountryCode,
            currencyCode: 'AED',
            testEnv: __DEV__,
          },
          // 3-D Secure / redirect return (matches app scheme + StripeProvider)
          returnURL: `${AUTH_CONFIG.STRIPE.urlScheme}://stripe-redirect`,
          allowsDelayedPaymentMethods: false,
          defaultBillingDetails: {
            ...(user?.name ? { name: user.name } : {}),
            ...(user?.email ? { email: user.email } : {}),
          },
        });
        if (initError) {
          log.warn('initPaymentSheet failed', initError.code, initError.message);
          setErrorText(t('payment.pleaseTryAgain'));
          return;
        }
        sheetReadyRef.current = true;
      }

      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        // User dismissed the sheet — let them retry, no error banner.
        if (presentError.code === 'Canceled') return;
        log.warn('presentPaymentSheet error', presentError.code, presentError.message);
        // Force a fresh initPaymentSheet on the next attempt — re-presenting a
        // failed sheet with the same client secret can error with a stale state.
        sheetReadyRef.current = false;
        setErrorText(presentError.message || t('payment.checkStatusFailed'));
        return;
      }

      // Success: the PaymentIntent is confirmed on-device. The webhook finalizes
      // the order + emails server-side; sync status in the background but show
      // success immediately (no waiting on webhook lag).
      checkPayment(true).catch(() => {});
      // Clear the cart right away — waiting for a nav button tap left paid
      // items in the cart if the user dismissed the screen with a gesture.
      // Skip when retrying an older pending order (cart holds unrelated items).
      if (!fromOrders) clearCart();
      // Same as the COD path: the card goes up at the moment of purchase, not when the
      // customer next opens Orders. Paid up front, so step one is already complete.
      startOrderActivityForNewOrder({
        orderNumber,
        orderId,
        paymentMethod: 'stripe',
        paymentStatus: 'paid',
        t,
        send: (payload) => saveLiveActivityToken(token, payload),
        authToken: token,
      });
      setPaid(true);
    } catch (e) {
      log.warn('Payment Sheet flow failed', e?.message || e);
      sheetReadyRef.current = false;
      setErrorText(t('payment.pleaseTryAgain'));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [clientSecret, initPaymentSheet, presentPaymentSheet, checkPayment, user, t, fromOrders, clearCart]);

  // --- Hosted browser fallback (retry of older pending orders) --------------
  const openHosted = useCallback(async () => {
    if (!paymentUrl) {
      setErrorText(t('payment.paymentLinkMissingMessage'));
      return;
    }
    // Same reasoning as payWithSheet: this also auto-starts on mount, and two
    // browser sessions on one payment link is worse than one.
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      await WebBrowser.openBrowserAsync(paymentUrl, {
        ...(Platform.OS === 'ios' && {
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
          enableBarCollapsing: true,
        }),
        showTitle: true,
      });
      if (canCheck) {
        const isPaid = await checkPayment();
        if (isPaid && !fromOrders) clearCart();
      }
    } catch (e) {
      log.warn('Failed to open hosted payment link', e?.message || e);
      Alert.alert(t('payment.couldNotOpenPaymentTitle'), t('payment.pleaseTryAgain'));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [paymentUrl, canCheck, checkPayment, t, fromOrders, clearCart]);

  // Auto-start the appropriate flow once on mount.
  useEffect(() => {
    if (autoStartedRef.current) return;
    autoStartedRef.current = true;
    (async () => {
      if (useNativeSheet) await payWithSheet();
      else if (paymentUrl) await openHosted();
      else setErrorText(t('payment.paymentLinkMissingMessage'));
    })();
  }, [useNativeSheet, paymentUrl, payWithSheet, openHosted, t]);

  // Cart is already cleared on payment success; keep these as a safety net for
  // the fresh-checkout flow only (never wipe the cart when paying an old order).
  const onViewOrder = useCallback(() => {
    if (!fromOrders) clearCart();
    router.replace('/(tabs)/orders');
  }, [clearCart, fromOrders]);

  const onContinueShopping = useCallback(() => {
    if (!fromOrders) clearCart();
    router.replace('/(tabs)/shop');
  }, [clearCart, fromOrders]);

  const title = useMemo(() => {
    if (orderNumber) return t('payment.payForOrderTitle', { orderNumber });
    return t('payment.completePaymentTitle');
  }, [orderNumber, t]);

  const onPrimaryPress = useNativeSheet ? payWithSheet : openHosted;

  // Modern full-screen success confirmation (shared with the COD flow).
  if (paid) {
    return (
      <OrderSuccessScreen
        title={t('payment.paymentReceivedTitle')}
        message={orderNumber
          ? t('payment.paymentSuccessMessageWithOrder', { orderNumber })
          : t('payment.paymentSuccessMessage')}
        viewOrderLabel={t('payment.viewOrder')}
        continueLabel={t('common.continueShopping')}
        onViewOrder={onViewOrder}
        onContinueShopping={onContinueShopping}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/bag')}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color={colors.label} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {useNativeSheet ? (
        // --- Native Payment Sheet: clean branded screen behind the sheet ------
        <View style={styles.nativeContent}>
          <Image source={{ uri: EMPTY_UNI_IMAGE }} style={styles.nativeUni} resizeMode="contain" />
          <Text style={styles.nativeTitle}>{t('payment.securePaymentTitle')}</Text>
          <Text style={styles.nativeSubtitle}>{t('payment.securePaymentSubtitle')}</Text>
          <Text style={styles.nativeTagline}>{t('payment.securePaymentTagline')}</Text>

          {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

          <TouchableOpacity
            style={[styles.primaryButton, styles.nativeButton, busy && styles.buttonDisabled]}
            onPress={payWithSheet}
            disabled={busy}
            activeOpacity={0.85}
          >
            <Ionicons name="card-outline" size={18} color={colors.white} />
            <Text style={styles.primaryButtonText}>{t('payment.payNow')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.replace('/profile/orders')}
            activeOpacity={0.85}
          >
            <Text style={styles.linkText}>{fromOrders ? t('payment.backToOrders') : t('payment.viewOrders')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // --- Hosted browser fallback (retry of older pending orders) ----------
        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.title}>{t('payment.stripeTitle')}</Text>
            <Text style={styles.subtitle}>{t('payment.completeInWindow')}</Text>

            {statusText ? <Text style={styles.status}>{statusText}</Text> : null}
            {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

            <TouchableOpacity
              style={[styles.primaryButton, busy && styles.buttonDisabled]}
              onPress={onPrimaryPress}
              disabled={busy}
              activeOpacity={0.85}
            >
              {busy ? <ActivityIndicator color={colors.white} /> : <Ionicons name="open-outline" size={18} color={colors.white} />}
              <Text style={styles.primaryButtonText}>{busy ? t('common.opening') : t('payment.openStripePayment')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, (!canCheck || checking) && styles.buttonDisabled]}
              onPress={() => checkPayment(false)}
              disabled={!canCheck || checking}
              activeOpacity={0.85}
            >
              {checking ? <ActivityIndicator color={colors.accent} /> : <Ionicons name="refresh" size={18} color={colors.accent} />}
              <Text style={styles.secondaryButtonText}>{checking ? t('payment.checking') : t('payment.checkPaymentStatus')}</Text>
            </TouchableOpacity>

            <Text style={styles.note}>
              {t('payment.pendingNote')}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.replace('/profile/orders')}
            activeOpacity={0.85}
          >
            <Text style={styles.linkText}>{fromOrders ? t('payment.backToOrders') : t('payment.viewOrders')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.groupedBg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.separator,
    backgroundColor: colors.card,
  },
  backButton: { padding: 4 },
  headerTitle: { ...T.navTitle, fontSize: 16, fontWeight: '700' },
  headerSpacer: { width: 28 },
  content: { flex: 1, padding: 20, gap: 12 },
  nativeContent: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 32,
    alignItems: 'center',
  },
  // Transparent PNG, so it sits directly on the cream page with no frame.
  nativeUni: {
    width: 168,
    height: 168,
    marginBottom: 8,
  },
  nativeTitle: { ...T.sectionTitle, textAlign: 'center' },
  nativeSubtitle: {
    ...T.label,
    fontWeight: '400',
    color: colors.secondaryLabel,
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
  nativeTagline: {
    ...T.label,
    fontWeight: '500',
    color: colors.label,
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
  nativeBusyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 28,
  },
  nativeBusyText: { ...T.label, color: colors.label },
  nativeButton: { alignSelf: 'stretch', marginTop: 16 },
  nativeCancelledNote: {
    ...T.label,
    fontWeight: '400',
    color: colors.secondaryLabel,
    lineHeight: 20,
    marginTop: 28,
    textAlign: 'center',
  },
  card: {
    borderWidth: 1,
    borderColor: colors.separator,
    borderRadius: 12,
    padding: 16,
    backgroundColor: colors.card,
  },
  title: { ...T.sectionTitleSmall },
  subtitle: { ...T.label, fontWeight: '400', color: colors.secondaryLabel, lineHeight: 20, marginTop: 6 },
  status: { ...T.label, color: colors.label, marginTop: 10 },
  errorText: { ...T.label, color: colors.accent, marginTop: 10 },
  primaryButton: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.cta,
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryButtonText: { ...T.buttonSmall, fontSize: 15, fontWeight: '700' },
  secondaryButton: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.accent,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.redBg,
  },
  secondaryButtonText: { ...T.buttonSmall, fontSize: 15, fontWeight: '700', color: colors.accent },
  linkButton: { alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 12 },
  linkText: { ...T.link },
  buttonDisabled: { opacity: 0.6 },
  note: { ...T.captionSmall, color: colors.secondaryLabel, lineHeight: 18, marginTop: 12 },
});
