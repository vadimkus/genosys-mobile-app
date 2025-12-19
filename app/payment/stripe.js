import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { fetchUserOrderById, fetchUserOrders } from '../../services/api';
import AUTH_CONFIG from '../../config/auth';
import { useLocalization } from '../../contexts/LocalizationContext';
import { createLogger } from '../../utils/logger';

const log = createLogger('StripePayment');

const isPaidLike = (order) => {
  const s = String(order?.status || '').toLowerCase();
  const ps = String(order?.paymentStatus || order?.payment_status || '').toLowerCase();
  return s === 'paid' || s === 'confirmed' || ps === 'paid' || ps === 'confirmed';
};

const extractStripeSessionIdFromUrl = (url) => {
  const u = String(url || '');
  // Stripe Checkout "session.url" commonly looks like:
  // https://checkout.stripe.com/c/pay/cs_test_...
  const m = u.match(/\/c\/pay\/(cs_[A-Za-z0-9_]+)/);
  return m?.[1] || '';
};

export default function StripePaymentScreen() {
  const { user } = useAuth();
  const { clearCart } = useCart();
  const token = user?.token || user?.accessToken || '';
  const { t } = useLocalization();

  const params = useLocalSearchParams();
  const paymentUrl = String(params.paymentUrl || '');
  const orderId = params.orderId ? String(params.orderId) : '';
  const orderNumber = params.orderNumber ? String(params.orderNumber) : '';
  const fromOrders = String(params.fromOrders || '') === '1';

  const [opening, setOpening] = useState(false);
  const [checking, setChecking] = useState(false);
  const [paid, setPaid] = useState(false);
  const [statusText, setStatusText] = useState('');

  const canCheck = !!token && (!!orderId || !!orderNumber);

  const checkPayment = useCallback(async () => {
    if (!canCheck) return;
    setChecking(true);
    try {
      // Prefer canonical detail endpoint (it returns a single order object).
      let match = null;
      if (orderId) {
        try {
          match = await fetchUserOrderById(token, orderId);
        } catch {
          match = null;
        }
      }
      if (!match && orderNumber) {
        const list = await fetchUserOrders(token, { page: 1, limit: 50 });
        const orders = Array.isArray(list) ? list : [];
        match = orders.find((o) => String(o?.orderNumber || o?.order_number || o?.number || '') === orderNumber) || null;
      }

      if (!match) {
        setStatusText(t('payment.couldNotFindOrderYet'));
        setPaid(false);
        return;
      }

      // If not paid yet, optionally trigger a server-side Stripe session refresh.
      // This helps when Stripe webhook is delayed.
      if (!isPaidLike(match)) {
        const sessionId = extractStripeSessionIdFromUrl(paymentUrl);
        if (sessionId) {
          try {
            const apiRoot = String(AUTH_CONFIG.API_BASE_URL || '').replace(/\/mobile\/?$/, '');
            const statusUrl = `${apiRoot}/stripe/payment-status?session_id=${encodeURIComponent(sessionId)}`;
            await fetch(statusUrl, { method: 'GET' }).catch(() => null);
          } catch {
            // ignore
          }
          // Re-fetch after refresh attempt
          if (orderId) {
            try {
              match = await fetchUserOrderById(token, orderId);
            } catch {
              // ignore
            }
          }
        }
      }

      const s = String(match?.status || '');
      const ps = String(match?.paymentStatus || match?.payment_status || '');
      const label = ps || s || 'PENDING';
      setStatusText(t('payment.currentStatus', { status: label }));

      if (isPaidLike(match)) {
        setPaid(true);
      } else {
        setPaid(false);
      }
    } catch (e) {
      setStatusText(e?.message || t('payment.checkStatusFailed'));
      setPaid(false);
    } finally {
      setChecking(false);
    }
  }, [canCheck, orderId, orderNumber, token]);

  const openPayment = useCallback(async () => {
    if (!paymentUrl) {
      Alert.alert(t('payment.paymentLinkMissingTitle'), t('payment.paymentLinkMissingMessage'));
      return;
    }
    setOpening(true);
    try {
      // In-app browser (SFSafariViewController / Chrome Custom Tabs).
      await WebBrowser.openBrowserAsync(paymentUrl, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
        showTitle: true,
        enableBarCollapsing: true,
      });
      // When user returns from the payment sheet, automatically check status once.
      if (canCheck) {
        await checkPayment();
      }
    } catch (e) {
      log.warn('Failed to open Stripe payment link', e?.message || e);
      Alert.alert(t('payment.couldNotOpenPaymentTitle'), t('payment.pleaseTryAgain'));
    } finally {
      setOpening(false);
    }
  }, [paymentUrl, canCheck, checkPayment]);

  useEffect(() => {
    // Auto open payment link on mount.
    (async () => {
      await openPayment();
    })();
  }, [openPayment]);

  useEffect(() => {
    if (!paid) return;
    Alert.alert(
      t('payment.paymentReceivedTitle'),
      orderNumber ? t('payment.paymentSuccessMessageWithOrder', { orderNumber }) : t('payment.paymentSuccessMessage'),
      [
        {
          text: t('payment.viewOrder'),
          onPress: () => {
            clearCart();
            router.replace('/(tabs)/orders');
          },
          style: 'default',
        },
        {
          text: t('common.continueShopping'),
          onPress: () => {
            clearCart();
            router.replace('/(tabs)/shop');
          },
          style: 'cancel',
        },
      ]
    );
  }, [paid, orderNumber, clearCart, fromOrders]);

  const title = useMemo(() => {
    if (orderNumber) return t('payment.payForOrderTitle', { orderNumber });
    return t('payment.completePaymentTitle');
  }, [orderNumber, t]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#dc2626" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>{t('payment.stripeTitle')}</Text>
          <Text style={styles.subtitle}>
            {t('payment.completeInWindow')}
          </Text>

          {statusText ? <Text style={styles.status}>{statusText}</Text> : null}

          <TouchableOpacity
            style={[styles.primaryButton, opening && styles.buttonDisabled]}
            onPress={openPayment}
            disabled={opening}
            activeOpacity={0.85}
          >
            {opening ? <ActivityIndicator color="#fff" /> : <Ionicons name="open-outline" size={18} color="#fff" />}
            <Text style={styles.primaryButtonText}>{opening ? t('common.opening') : t('payment.openStripePayment')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, (!canCheck || checking) && styles.buttonDisabled]}
            onPress={checkPayment}
            disabled={!canCheck || checking}
            activeOpacity={0.85}
          >
            {checking ? <ActivityIndicator color="#dc2626" /> : <Ionicons name="refresh" size={18} color="#dc2626" />}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#ffffff',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1D1D1F' },
  headerSpacer: { width: 28 },
  content: { flex: 1, padding: 20, gap: 12 },
  card: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  title: { fontSize: 18, fontWeight: '700', color: '#1D1D1F' },
  subtitle: { marginTop: 6, fontSize: 14, color: '#8E8E93', lineHeight: 20 },
  status: { marginTop: 10, fontSize: 14, color: '#1D1D1F', fontWeight: '600' },
  primaryButton: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#dc2626',
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  secondaryButton: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#dc2626',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFF5F5',
  },
  secondaryButtonText: { color: '#dc2626', fontSize: 15, fontWeight: '700' },
  linkButton: { alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 12 },
  linkText: { color: '#007AFF', fontSize: 14, fontWeight: '600' },
  buttonDisabled: { opacity: 0.6 },
  note: { marginTop: 12, fontSize: 12, color: '#8E8E93', lineHeight: 18 },
});



