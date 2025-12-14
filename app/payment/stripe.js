import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { fetchUserOrders } from '../../services/api';

const isPaidLike = (order) => {
  const s = String(order?.status || '').toLowerCase();
  const ps = String(order?.paymentStatus || order?.payment_status || '').toLowerCase();
  return s === 'paid' || s === 'confirmed' || ps === 'paid' || ps === 'confirmed';
};

export default function StripePaymentScreen() {
  const { user } = useAuth();
  const { clearCart } = useCart();
  const token = user?.token || user?.accessToken || '';

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
      const list = await fetchUserOrders(token, orderId ? { orderId } : { page: 1, limit: 50 });
      const orders = Array.isArray(list) ? list : [];
      const match = orderId
        ? orders.find((o) => String(o?.id || o?.orderId || '') === orderId) || orders[0]
        : orders.find((o) => String(o?.orderNumber || o?.order_number || o?.number || '') === orderNumber);

      if (!match) {
        setStatusText('Could not find the order yet. Please try again in a few seconds.');
        setPaid(false);
        return;
      }

      const label = String(match?.status || match?.paymentStatus || match?.payment_status || 'PENDING');
      setStatusText(`Current status: ${label}`);

      if (isPaidLike(match)) {
        setPaid(true);
      } else {
        setPaid(false);
      }
    } catch (e) {
      setStatusText(e?.message || 'Failed to check payment status.');
      setPaid(false);
    } finally {
      setChecking(false);
    }
  }, [canCheck, orderId, orderNumber, token]);

  const openPayment = useCallback(async () => {
    if (!paymentUrl) {
      Alert.alert('Payment link missing', 'We could not open the payment link. Please try again.');
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
      console.warn('Failed to open Stripe payment link:', e);
      Alert.alert('Could not open payment', 'Please try again.');
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
      'Payment received',
      `Your payment was successful${orderNumber ? ` for order ${orderNumber}` : ''}.`,
      [
        {
          text: fromOrders ? 'Back to Orders' : 'Continue Shopping',
          onPress: () => {
            if (!fromOrders) {
              clearCart();
              router.replace('/(tabs)/shop');
            } else {
              router.replace('/profile/orders');
            }
          },
        },
        ...(fromOrders
          ? [
              {
                text: 'Continue Shopping',
                onPress: () => router.replace('/(tabs)/shop'),
              },
            ]
          : []),
      ]
    );
  }, [paid, orderNumber, clearCart, fromOrders]);

  const title = useMemo(() => {
    if (orderNumber) return `Pay for Order ${orderNumber}`;
    return 'Complete Payment';
  }, [orderNumber]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#E74C3C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Stripe Payment</Text>
          <Text style={styles.subtitle}>
            Complete your payment in the secure window. When you return, tap “Check payment status”.
          </Text>

          {statusText ? <Text style={styles.status}>{statusText}</Text> : null}

          <TouchableOpacity
            style={[styles.primaryButton, opening && styles.buttonDisabled]}
            onPress={openPayment}
            disabled={opening}
            activeOpacity={0.85}
          >
            {opening ? <ActivityIndicator color="#fff" /> : <Ionicons name="open-outline" size={18} color="#fff" />}
            <Text style={styles.primaryButtonText}>{opening ? 'Opening…' : 'Open Stripe Payment'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, (!canCheck || checking) && styles.buttonDisabled]}
            onPress={checkPayment}
            disabled={!canCheck || checking}
            activeOpacity={0.85}
          >
            {checking ? <ActivityIndicator color="#E74C3C" /> : <Ionicons name="refresh" size={18} color="#E74C3C" />}
            <Text style={styles.secondaryButtonText}>{checking ? 'Checking…' : 'Check payment status'}</Text>
          </TouchableOpacity>

          <Text style={styles.note}>
            If payment is not completed yet, your order will stay pending until the payment is confirmed.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.replace('/profile/orders')}
          activeOpacity={0.85}
        >
          <Text style={styles.linkText}>{fromOrders ? 'Back to Orders' : 'View Orders'}</Text>
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
    backgroundColor: '#E74C3C',
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
    borderColor: '#E74C3C',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFF5F5',
  },
  secondaryButtonText: { color: '#E74C3C', fontSize: 15, fontWeight: '700' },
  linkButton: { alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 12 },
  linkText: { color: '#007AFF', fontSize: 14, fontWeight: '600' },
  buttonDisabled: { opacity: 0.6 },
  note: { marginTop: 12, fontSize: 12, color: '#8E8E93', lineHeight: 18 },
});



