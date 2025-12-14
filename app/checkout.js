import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';
import { calculateCartTotals } from '../utils/cartUtils';
import { submitCODOrder, submitCardOrder, generateOrderNumber } from '../services/orderService';
import { getDefaultPaymentMethod, setDefaultPaymentMethod, PAYMENT_METHODS } from '../services/paymentPreferences';
import { useLocalization } from '../contexts/LocalizationContext';
import { parseGenosysAddress, getAddressLine, formatAddressForDisplay } from '../utils/addressUtils';

function isValidEmail(value) {
  const email = String(value || '').trim();
  if (!email) return false;
  // Stricter (still simple) email validation:
  // - must have local@domain.tld
  // - TLD at least 2 chars
  // - no trailing dot
  // - no spaces
  if (email.includes(' ')) return false;
  if (email.endsWith('.')) return false;
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (!local || !domain) return false;
  if (local.length < 1) return false;
  if (domain.length < 3) return false;
  const domainParts = domain.split('.');
  if (domainParts.length < 2) return false;
  const tld = domainParts[domainParts.length - 1];
  if (!tld || tld.length < 2) return false;
  // Basic allowed characters check (keeps it practical for UI validation).
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
}

function normalizeUaePhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (!digits) return '';

  // 05XXXXXXXX -> +9715XXXXXXXX
  if (digits.startsWith('05') && digits.length === 10) {
    return `+971${digits.slice(1)}`;
  }

  // 5XXXXXXXX -> +9715XXXXXXXX
  if (digits.startsWith('5') && digits.length === 9) {
    return `+971${digits}`;
  }

  // 9715XXXXXXXX -> +9715XXXXXXXX
  if (digits.startsWith('971')) {
    return `+${digits}`;
  }

  // Already has + but we stripped it, handle UAE numbers entered as 971...
  return `+${digits}`;
}

function isValidUaeMobilePhone(raw) {
  const normalized = normalizeUaePhone(raw);
  const digits = normalized.replace(/\D/g, '');
  // UAE mobile: +9715XXXXXXXX (12 digits including 971)
  return digits.startsWith('9715') && digits.length === 12;
}

function formatUaePhoneForInput(raw) {
  const normalized = normalizeUaePhone(raw);
  if (!normalized) return '';

  const digits = normalized.replace(/\D/g, '');
  if (!digits.startsWith('971')) return normalized;

  const rest = digits.slice(3); // after 971
  // Format as: +971 5X XXX XXXX
  const p1 = rest.slice(0, 2);
  const p2 = rest.slice(2, 5);
  const p3 = rest.slice(5, 9);
  const parts = [`+971`, p1, p2, p3].filter(Boolean);
  return parts.join(' ').trim();
}

function getDeliveryEtaInfo(selectedEmirate) {
  const emirate = String(selectedEmirate || '').trim();
  const isDubai = emirate.toLowerCase() === 'dubai';
  return {
    isDubai,
    // Dubai: today 1–2 hours; others: tomorrow 24–36 hours
    etaLabel: isDubai ? 'today' : 'tomorrow',
    etaWindow: isDubai ? '1–2 hours' : '24–36 hours',
  };
}

function computeSavingsAED(items, totalsSubtotal) {
  const paid = (items || []).filter((it) => !(it?.isPromotionItem === true || it?.selectedSize === '__PROMO__'));

  const originalSubtotal = paid.reduce((sum, it) => {
    const qty = Number(it?.quantity) || 0;
    const original = Number(it?.product?.originalPrice);
    const current = Number(it?.product?.displayPrice ?? it?.product?.price ?? 0);
    const unit = Number.isFinite(original) && original > 0 ? original : (Number.isFinite(current) ? current : 0);
    return sum + unit * qty;
  }, 0);

  const savings = (Number(originalSubtotal) || 0) - (Number(totalsSubtotal) || 0);
  return Math.max(0, savings);
}

function EmirateFlagIcon({ name }) {
  const emirate = String(name || '').trim();

  // UAE national flag (used for Fujairah per requirement)
  const UAE = () => (
    <View style={flagStyles.flagBox}>
      <View style={flagStyles.uaeRed} />
      <View style={flagStyles.uaeRight}>
        <View style={[flagStyles.uaeStripe, { backgroundColor: '#00732F' }]} />
        <View style={[flagStyles.uaeStripe, { backgroundColor: '#FFFFFF' }]} />
        <View style={[flagStyles.uaeStripe, { backgroundColor: '#000000' }]} />
      </View>
    </View>
  );

  // Abu Dhabi: red field with a small white canton in the upper hoist corner
  const AbuDhabi = () => (
    <View style={[flagStyles.flagBox, { backgroundColor: '#D81E05' }]}>
      <View style={flagStyles.abuDhabiCanton} />
    </View>
  );

  // Dubai / Ajman: red field with a vertical white stripe at the hoist
  const DubaiAjman = () => (
    <View style={[flagStyles.flagBox, { backgroundColor: '#D81E05' }]}>
      <View style={flagStyles.hoistWhiteStripe} />
    </View>
  );

  // Sharjah / Ras Al Khaimah: red rectangle on a white field
  const SharjahRas = () => (
    <View style={[flagStyles.flagBox, { backgroundColor: '#FFFFFF' }]}>
      <View style={flagStyles.centerRedRect} />
    </View>
  );

  // Umm Al Quwain: red field with a vertical white stripe at hoist and a white crescent + star
  const UmmAlQuwain = () => (
    <View style={[flagStyles.flagBox, { backgroundColor: '#D81E05' }]}>
      <View style={flagStyles.hoistWhiteStripe} />
      {/* Crescent (approx) */}
      <View style={flagStyles.uaqCrescentOuter} />
      <View style={flagStyles.uaqCrescentInner} />
      {/* Star */}
      <Text style={flagStyles.uaqStar}>★</Text>
    </View>
  );

  if (emirate === 'Fujairah') return <UAE />;
  if (emirate === 'Abu Dhabi') return <AbuDhabi />;
  if (emirate === 'Dubai' || emirate === 'Ajman') return <DubaiAjman />;
  if (emirate === 'Sharjah' || emirate === 'Ras Al Khaimah') return <SharjahRas />;
  if (emirate === 'Umm Al Quwain') return <UmmAlQuwain />;

  return <UAE />;
}

export default function CheckoutScreen() {
  const { user } = useAuth();
  const { items, getTotalItems, getCartSummary, selectedEmirate, setSelectedEmirate, clearCart, getAvailableEmirates, reloadShippingRates } = useCart();
  const { t } = useLocalization();
  const scrollRef = useRef(null);
  
  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [addressDetails, setAddressDetails] = useState(null);
  const [orderNotes, setOrderNotes] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cod');

  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    phone: false,
    address: false,
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  
  // UI states
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderNumber] = useState(() => generateOrderNumber());
  const [orderSummaryExpanded, setOrderSummaryExpanded] = useState(false);

  // Calculate totals
  const cartSummary = getCartSummary();
  const totals = calculateCartTotals(items, user, selectedEmirate, getAvailableEmirates());
  const safeSubtotal = Number(totals.subtotal) || 0;
  const safeShipping = Number(totals.shipping) || 0;
  const safeVat = Number(totals.vatAmount) || 0;
  const safeTotal = Number(totals.total) || 0;
  const savingsAED = computeSavingsAED(items, safeSubtotal);
  const etaInfo = getDeliveryEtaInfo(selectedEmirate);
  const deliveryEtaText = etaInfo.isDubai
    ? t('checkout.deliveryEtaDubai')
    : t('checkout.deliveryEtaOther');

  const errors = useMemo(() => {
    const next = {};
    if (!firstName.trim()) next.firstName = t('checkout.firstNameRequired');
    if (!lastName.trim()) next.lastName = t('checkout.lastNameRequired');
    if (!email.trim()) next.email = t('checkout.emailRequired');
    else if (!isValidEmail(email)) next.email = t('checkout.validationInvalidEmail');
    if (!phone.trim()) next.phone = t('checkout.phoneRequired');
    else if (!isValidUaeMobilePhone(phone)) next.phone = t('addAddress.validationInvalidUaePhone');
    if (!address.trim()) next.address = t('checkout.addressRequired');
    return next;
  }, [firstName, lastName, email, phone, address, t]);

  const showError = (field) => {
    return !!errors[field] && (submitAttempted || touched[field]);
  };

  const openAddressInMaps = async () => {
    const query = String(address || '').trim();
    if (!query) return;
    const url =
      Platform.OS === 'ios'
        ? `http://maps.apple.com/?q=${encodeURIComponent(query)}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(t('common.error'), t('checkout.couldNotOpenMaps'));
    }
  };

  const isPromoItem = (item) => item?.isPromotionItem === true || item?.selectedSize === '__PROMO__';
  const paidItems = items.filter((it) => !isPromoItem(it));
  const promoItems = items.filter((it) => isPromoItem(it));

  // Always refresh DB-driven shipping rates when opening checkout
  useEffect(() => {
    reloadShippingRates?.();
  }, []);

  // Load default payment method preference
  useEffect(() => {
    (async () => {
      const saved = await getDefaultPaymentMethod();
      setSelectedPaymentMethod(saved);
    })();
  }, []);

  const selectPaymentMethod = async (method) => {
    const safe =
      method === PAYMENT_METHODS.CARD
        ? PAYMENT_METHODS.CARD
        : PAYMENT_METHODS.COD;
    setSelectedPaymentMethod(safe);
    // Persist for next checkout
    try {
      await setDefaultPaymentMethod(safe);
    } catch {
      // ignore preference save failures
    }
  };

  // Pre-fill form with user data
  useEffect(() => {
    if (user) {
      const nameParts = user.name?.split(' ') || [];
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      const parsed = parseGenosysAddress(user.address || '');
      setAddressDetails(parsed);
      // Show only the clean address line in the text input (no GENOSYS_ADDR_V1 payload)
      setAddress(getAddressLine(parsed || (user.address || '')));

      // If the saved address contains a phone, use it only when profile phone is empty
      if (!String(user.phone || '').trim() && parsed?.phone) {
        setPhone(String(parsed.phone));
      }

      // If saved address contains emirate, pre-select it when possible
      if (parsed?.emirate && typeof setSelectedEmirate === 'function') {
        const next = String(parsed.emirate);
        setSelectedEmirate(next);
      }
    }
  }, [user]);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.replace('/(tabs)/bag');
    }
  }, [items.length]);

  // Redirect if user is not logged in
  useEffect(() => {
    if (!user) {
      Alert.alert(
        t('checkout.loginRequiredTitle'),
        t('checkout.loginRequiredMessage'),
        [
          { text: t('common.cancel'), style: 'cancel', onPress: () => router.back() },
          { text: 'Login', onPress: () => router.push('/auth/login') }
        ]
      );
    }
  }, [user]);

  const handleSubmit = async () => {
    setSubmitAttempted(true);
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      address: true,
    });

    const hasErrors =
      !firstName.trim() ||
      !lastName.trim() ||
      !isValidEmail(email) ||
      !isValidUaeMobilePhone(phone) ||
      !address.trim();

    if (hasErrors) {
      // Scroll user to the top of the form so they see the first highlighted field.
      try {
        scrollRef.current?.scrollTo?.({ y: 0, animated: true });
      } catch {
        // ignore
      }
      return;
    }

    setIsProcessing(true);

    try {
      const cleanedAddress = address.trim();
      const addressFromV1 =
        addressDetails &&
        cleanedAddress &&
        String(addressDetails.address || '').trim() &&
        cleanedAddress === String(addressDetails.address || '').trim()
          ? formatAddressForDisplay(addressDetails)
          : cleanedAddress;

      // Prepare order data
      const orderData = {
        orderNumber,
        customerName: `${firstName.trim()} ${lastName.trim()}`,
        customerEmail: email.trim(),
        customerPhone: normalizeUaePhone(phone),
        customerAddress: addressFromV1,
        emirate: selectedEmirate,
        items: items,
        subtotal: safeSubtotal,
        shippingCost: safeShipping,
        vatAmount: safeVat,
        total: safeTotal,
        paymentMethod: selectedPaymentMethod,
        orderNotes: orderNotes.trim(),
        userToken: user?.token || user?.accessToken || null,
      };

      console.log('📦 Submitting order to database and sending emails:', {
        orderNumber: orderData.orderNumber,
        customerEmail: orderData.customerEmail,
        paymentMethod: orderData.paymentMethod,
        total: orderData.total,
        itemCount: orderData.items.length
      });

      // Submit order based on payment method
      let result;
      if (selectedPaymentMethod === PAYMENT_METHODS.COD) {
        result = await submitCODOrder(orderData);
      } else {
        result = await submitCardOrder(orderData);
      }

      if (result.success) {
        console.log('✅ Checkout step success:', result);

        // COD: submit immediately (no payment step)
        if (selectedPaymentMethod === PAYMENT_METHODS.COD) {
          clearCart();
          Alert.alert(
            t('checkout.orderSubmittedTitle'),
            t('checkout.orderSubmittedMessageCOD', { orderNumber }),
            [{ text: t('checkout.continueShopping'), onPress: () => router.replace('/(tabs)/shop') }]
          );
          return;
        }

        // Card (incl. Apple Pay / Google Pay): DO NOT claim success until payment is confirmed.
        if (!result.paymentUrl) {
          Alert.alert(
            t('checkout.paymentLinkUnavailableTitle'),
            t('checkout.paymentLinkUnavailableMessage')
          );
          return;
        }

        router.push({
          pathname: '/payment/stripe',
          params: {
            orderId: String(result.orderId || ''),
            orderNumber: String(orderNumber),
            paymentUrl: String(result.paymentUrl),
          },
        });
      } else {
        console.error('❌ Order submission failed:', result);
        Alert.alert(
          t('checkout.orderSubmissionFailedTitle'),
          result.error || t('checkout.orderProcessingErrorMessage'),
          [
            { text: t('checkout.tryAgain'), style: 'default' },
            { 
              text: t('checkout.contactSupport'), 
              onPress: async () => {
                const phoneNumber = '971585487665';
                const message = `Hi! I need help with placing order ${orderNumber}. Payment method: ${selectedPaymentMethod}. Can you assist me?`;
                const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                try {
                  await Linking.openURL(whatsappUrl);
                } catch {
                  Alert.alert(t('support.whatsappOpenFailedTitle'), t('support.whatsappOpenFailedMessage'));
                }
              }
            }
          ]
        );
      }

    } catch (error) {
      console.error('❌ Order processing error:', error);
      Alert.alert(
        t('checkout.orderProcessingErrorTitle'),
        t('checkout.orderProcessingErrorMessage'),
        [
          { text: t('checkout.tryAgain'), style: 'default' },
          { 
            text: t('checkout.contactSupport'), 
            onPress: async () => {
              const phoneNumber = '971585487665';
              const message = `Hi! I encountered an error while placing order ${orderNumber}. Can you help me?`;
              const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
              try {
                await Linking.openURL(whatsappUrl);
              } catch {
                Alert.alert(t('support.whatsappOpenFailedTitle'), t('support.whatsappOpenFailedMessage'));
              }
            }
          }
        ]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return null; // Will redirect via useEffect
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>{t('checkout.title')}</Text>
        
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          
          {/* Order Summary Header */}
          <View style={styles.orderHeaderCard}>
            <TouchableOpacity
              style={styles.orderHeader}
              onPress={() => setOrderSummaryExpanded((v) => !v)}
              activeOpacity={0.85}
            >
              <View style={styles.orderHeaderLeft}>
                <Text style={styles.orderNumber}>Order {orderNumber}</Text>
                <Text style={styles.itemCount}>{t('bag.header', { count: getTotalItems(), label: getTotalItems() === 1 ? t('bag.item') : t('bag.items') })}</Text>
              </View>
              <Ionicons
                name={orderSummaryExpanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#ffffff"
              />
            </TouchableOpacity>

            {orderSummaryExpanded ? (
              <View style={styles.orderSummaryBody}>
                <Text style={styles.orderSummaryTitle}>{t('checkout.orderSummary')}</Text>

                {paidItems.map((it, idx) => {
                  const name = it.product?.name || 'Item';
                  const qty = Number(it.quantity) || 0;
                  const size = it.selectedSize ? String(it.selectedSize) : '';
                  const color = it.selectedColor ? String(it.selectedColor) : '';
                  const extras = [
                    size && `${t('common.size')}: ${size}`,
                    color && `${t('common.color')}: ${color}`,
                  ]
                    .filter(Boolean)
                    .join(' • ');
                  const price = Number(it.product?.displayPrice ?? it.product?.price ?? 0) || 0;
                  return (
                    <Text key={`${it.product?.id || name}-${idx}`} style={styles.orderSummaryLine}>
                      {qty}× {name}{extras ? ` — ${extras}` : ''} — AED {price.toFixed(2)}
                    </Text>
                  );
                })}

                {promoItems.length ? (
                  <>
                    <Text style={styles.orderSummarySection}>{t('checkout.promotion')}</Text>
                    {promoItems.map((it, idx) => {
                      const name = it.product?.name || 'Promo item';
                      const qty = Number(it.quantity) || 1;
                      const size = it.product?.size ? String(it.product.size) : '';
                      return (
                        <Text key={`${it.product?.id || name}-promo-${idx}`} style={styles.orderSummaryLine}>
                          {qty}× {name}{size ? ` — ${size}` : ''} — {t('common.free')}
                        </Text>
                      );
                    })}
                  </>
                ) : null}

                <View style={styles.orderSummaryDivider} />
                <Text style={styles.orderSummarySection}>{t('checkout.totals')}</Text>
                <View style={styles.orderTotalsRow}>
                  <Text style={styles.orderTotalsLabel}>{t('checkout.subtotal')}</Text>
                  <Text style={styles.orderTotalsValue}>AED {safeSubtotal.toFixed(2)}</Text>
                </View>
                <View style={styles.orderTotalsRow}>
                  <Text style={styles.orderTotalsLabel}>{t('checkout.shippingTo', { emirate: selectedEmirate })}</Text>
                  <Text style={styles.orderTotalsValue}>{safeShipping === 0 ? t('common.free') : `AED ${safeShipping.toFixed(2)}`}</Text>
                </View>
                <View style={styles.orderTotalsRow}>
                  <Text style={styles.orderTotalsLabel}>{t('checkout.vatIncluded')}</Text>
                  <Text style={styles.orderTotalsValue}>AED {safeVat.toFixed(2)}</Text>
                </View>
                <View style={styles.orderTotalsRow}>
                  <Text style={styles.orderTotalsLabelStrong}>{t('checkout.total')}</Text>
                  <Text style={styles.orderTotalsValueStrong}>AED {safeTotal.toFixed(2)}</Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* Shipping Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location" size={20} color="#E74C3C" />
              <Text style={styles.sectionTitle}>{t('checkout.shippingInformation')}</Text>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <Text style={styles.label}>{t('checkout.firstName')} *</Text>
                <TextInput
                  style={[styles.input, showError('firstName') && styles.inputError]}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder={t('checkout.enterFirstName')}
                  autoCapitalize="words"
                  onBlur={() => setTouched((p) => ({ ...p, firstName: true }))}
                />
                {showError('firstName') ? <Text style={styles.helperError}>{errors.firstName}</Text> : null}
              </View>
              <View style={styles.formHalf}>
                <Text style={styles.label}>{t('checkout.lastName')} *</Text>
                <TextInput
                  style={[styles.input, showError('lastName') && styles.inputError]}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder={t('checkout.enterLastName')}
                  autoCapitalize="words"
                  onBlur={() => setTouched((p) => ({ ...p, lastName: true }))}
                />
                {showError('lastName') ? <Text style={styles.helperError}>{errors.lastName}</Text> : null}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('checkout.emailAddress')} *</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={[
                    styles.input,
                    styles.inputWithRightIcon,
                    showError('email') && styles.inputError,
                  ]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t('checkout.enterEmail')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                />
                {isValidEmail(email) ? (
                  <View style={styles.inputRightIcon}>
                    <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                  </View>
                ) : null}
              </View>
              {showError('email') ? <Text style={styles.helperError}>{errors.email}</Text> : null}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('checkout.phoneNumber')} *</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={[
                    styles.input,
                    styles.inputWithRightIcon,
                    showError('phone') && styles.inputError,
                  ]}
                  value={phone}
                  onChangeText={(text) => setPhone(formatUaePhoneForInput(text))}
                  placeholder={t('checkout.enterPhone')}
                  keyboardType="phone-pad"
                  onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
                />
                {isValidUaeMobilePhone(phone) ? (
                  <View style={styles.inputRightIcon}>
                    <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                  </View>
                ) : null}
              </View>
              {showError('phone') ? <Text style={styles.helperError}>{errors.phone}</Text> : null}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('checkout.deliveryAddress')} *</Text>
              <TextInput
                style={[styles.input, styles.textArea, showError('address') && styles.inputError]}
                value={address}
                onChangeText={setAddress}
                placeholder={t('checkout.enterAddress')}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                onBlur={() => setTouched((p) => ({ ...p, address: true }))}
              />
              {showError('address') ? <Text style={styles.helperError}>{errors.address}</Text> : null}

              <TouchableOpacity
                style={[styles.pinRowButton, !String(address || '').trim() && styles.pinButtonDisabled]}
                onPress={openAddressInMaps}
                disabled={!String(address || '').trim()}
                activeOpacity={0.85}
              >
                <Ionicons name="location-outline" size={16} color="#007AFF" />
                <Text style={styles.pinRowButtonText}>{t('checkout.pinOnMap')}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('checkout.emirate')} *</Text>
              <Text style={styles.deliveryEtaHint}>{deliveryEtaText}</Text>
              <View style={styles.emirateGrid}>
                {getAvailableEmirates().map((emirate) => (
                  <TouchableOpacity
                    key={emirate.name}
                    style={[
                      styles.emirateOption,
                      selectedEmirate === emirate.name && styles.emirateOptionSelected
                    ]}
                    onPress={() => setSelectedEmirate(emirate.name)}
                  >
                    <View style={styles.emirateTopRow}>
                      <View style={styles.emirateTopLeft}>
                        <EmirateFlagIcon name={emirate.name} />
                        <Text
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={[
                            styles.emirateText,
                            selectedEmirate === emirate.name && styles.emirateTextSelected,
                          ]}
                        >
                          {emirate.name}
                        </Text>
                      </View>
                      {selectedEmirate === emirate.name ? (
                        <Ionicons name="checkmark" size={16} color="#E74C3C" />
                      ) : null}
                    </View>
                    <View style={styles.emirateBottomRow}>
                      {Number(emirate.shippingCost) === 0 ? (
                        <View style={styles.freeBadge}>
                          <Text style={styles.freeBadgeText}>{t('common.free')}</Text>
                        </View>
                      ) : (
                        <Text style={styles.emirateShipping}>AED {emirate.shippingCost}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="card" size={20} color="#27AE60" />
              <Text style={styles.sectionTitle}>{t('checkout.paymentMethod')}</Text>
            </View>

            <Text style={styles.paymentHint}>
              {t('checkout.defaultPaymentMethod')}:{' '}
              <Text style={styles.paymentHintStrong}>
                {selectedPaymentMethod === PAYMENT_METHODS.CARD ? t('checkout.cardPayment') : t('checkout.cashOnDelivery')}
              </Text>
              {' '}• {t('checkout.tapToChange')}
            </Text>

            <View style={styles.paymentOptions}>
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  selectedPaymentMethod === PAYMENT_METHODS.COD && styles.paymentOptionSelected
                ]}
                onPress={() => selectPaymentMethod(PAYMENT_METHODS.COD)}
              >
                <View style={styles.paymentOptionHeader}>
                  <Ionicons 
                    name={selectedPaymentMethod === PAYMENT_METHODS.COD ? "radio-button-on" : "radio-button-off"} 
                    size={20} 
                    color={selectedPaymentMethod === PAYMENT_METHODS.COD ? "#E74C3C" : "#C7C7CC"} 
                  />
                  <Text style={styles.paymentTitle}>{t('checkout.cashOnDelivery')}</Text>
                </View>
                <Text style={styles.paymentDescription}>{t('checkout.payWhenDelivered')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  selectedPaymentMethod === PAYMENT_METHODS.CARD && styles.paymentOptionSelected
                ]}
                onPress={() => selectPaymentMethod(PAYMENT_METHODS.CARD)}
              >
                <View style={styles.paymentOptionHeader}>
                  <Ionicons 
                    name={selectedPaymentMethod === PAYMENT_METHODS.CARD ? "radio-button-on" : "radio-button-off"} 
                    size={20} 
                    color={selectedPaymentMethod === PAYMENT_METHODS.CARD ? "#E74C3C" : "#C7C7CC"} 
                  />
                  <Text style={styles.paymentTitle}>{t('checkout.cardPayment')}</Text>
                </View>
                <Text style={styles.paymentDescription}>{t('checkout.paySecurelyStripe')}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.trustRow}>
              <Ionicons name="lock-closed" size={14} color="#6B7280" />
              <Text style={styles.trustText}>{t('checkout.trustStripe')}</Text>
            </View>
          </View>

          {/* Order Notes */}
          <View style={styles.section}>
            <Text style={styles.label}>{t('checkout.orderNotesOptional')}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={orderNotes}
              onChangeText={setOrderNotes}
              placeholder={t('checkout.orderNotesPlaceholder')}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />
          </View>

          {/* Order Summary */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="receipt" size={20} color="#007AFF" />
              <Text style={styles.sectionTitle}>{t('checkout.orderSummary')}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {t('checkout.subtotal')} ({t('bag.header', { count: getTotalItems(), label: getTotalItems() === 1 ? t('bag.item') : t('bag.items') })})
              </Text>
              <Text style={styles.summaryValue}>AED {safeSubtotal.toFixed(2)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('checkout.shippingTo', { emirate: selectedEmirate })}</Text>
              <Text style={styles.summaryValue}>
                {safeShipping === 0 ? t('common.free') : `AED ${safeShipping.toFixed(2)}`}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('checkout.vatIncluded')}</Text>
              <Text style={styles.summaryValue}>AED {safeVat.toFixed(2)}</Text>
            </View>

            {totals.subtotal >= 1000 && (
              <View style={styles.freeShippingBanner}>
                <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
                <Text style={styles.freeShippingText}>{t('checkout.freeShippingApplied')}</Text>
              </View>
            )}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t('checkout.total')}</Text>
              <Text style={styles.totalValue}>AED {safeTotal.toFixed(2)}</Text>
            </View>

            <Text style={styles.vatNote}>*{t('checkout.allPricesVatInclusive')}</Text>
          </View>

        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomContainer}>
        <View style={styles.stickySummaryRow}>
          <View style={styles.stickySummaryLeft}>
            <View style={styles.etaPill}>
              <Ionicons name="time-outline" size={14} color="#6B7280" />
              <Text style={styles.etaPillText} numberOfLines={1} ellipsizeMode="tail">
                {deliveryEtaText}
              </Text>
            </View>
            {savingsAED > 0.5 ? (
              <View style={styles.savingsPill}>
                <Ionicons name="pricetag-outline" size={14} color="#16A34A" />
                <Text style={styles.savingsPillText}>
                  {t('checkout.youSave')} AED {savingsAED.toFixed(2)}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.placeOrderButton, isProcessing && styles.placeOrderButtonDisabled]}
          onPress={handleSubmit}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Ionicons name="bag-check" size={20} color="#ffffff" />
          )}
          <Text style={styles.placeOrderButtonText}>
            {isProcessing ? t('checkout.processing') : t('checkout.placeOrder')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  
  // Order Header
  orderHeaderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  orderHeader: {
    backgroundColor: '#E74C3C',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderHeaderLeft: {
    flex: 1,
    paddingRight: 12,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  itemCount: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  orderSummaryBody: {
    backgroundColor: '#F2F2F7',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    padding: 14,
    paddingTop: 12,
  },
  orderSummaryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  orderSummarySection: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '800',
    color: '#1D1D1F',
  },
  orderSummaryLine: {
    fontSize: 12,
    color: '#3C3C43',
    lineHeight: 18,
    marginBottom: 4,
  },
  orderSummaryDivider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginTop: 10,
    marginBottom: 6,
  },
  orderTotalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  orderTotalsLabel: {
    fontSize: 12,
    color: '#3C3C43',
    fontWeight: '600',
  },
  orderTotalsValue: {
    fontSize: 12,
    color: '#1D1D1F',
    fontWeight: '700',
  },
  orderTotalsLabelStrong: {
    fontSize: 13,
    color: '#1D1D1F',
    fontWeight: '800',
  },
  orderTotalsValueStrong: {
    fontSize: 13,
    color: '#1D1D1F',
    fontWeight: '900',
  },

  // Section
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1D1D1F',
  },

  // Form
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  formHalf: {
    flex: 1,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1D1D1F',
    backgroundColor: '#ffffff',
  },
  inputWrap: {
    position: 'relative',
  },
  inputWithRightIcon: {
    paddingRight: 44,
  },
  inputRightIcon: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputError: {
    borderColor: '#E74C3C',
    backgroundColor: '#FFF5F5',
  },
  helperError: {
    marginTop: 6,
    fontSize: 12,
    color: '#E74C3C',
    fontWeight: '600',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 10,
  },
  pinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  pinRowButton: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  pinButtonDisabled: {
    opacity: 0.5,
  },
  pinButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  pinRowButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#007AFF',
  },

  // Emirates
  emirateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  emirateTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emirateTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    paddingRight: 8,
  },
  emirateOption: {
    width: '48%',
    minHeight: 56,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  emirateOptionSelected: {
    borderColor: '#E74C3C',
    backgroundColor: '#FFF5F5',
  },
  emirateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3C3C43',
    flexShrink: 1,
  },
  emirateTextSelected: {
    color: '#E74C3C',
  },
  emirateBottomRow: {
    marginTop: 6,
    alignItems: 'flex-end',
  },
  emirateShipping: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
  },
  freeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  freeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#16A34A',
  },
  deliveryEtaHint: {
    marginTop: 2,
    marginBottom: 8,
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },

  // Payment
  paymentOptions: {
    gap: 12,
  },
  paymentOption: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  paymentOptionSelected: {
    borderColor: '#E74C3C',
    backgroundColor: '#FFF5F5',
  },
  paymentOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  paymentDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 32,
  },
  paymentHint: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: -6,
    marginBottom: 10,
  },
  paymentHintStrong: {
    color: '#1D1D1F',
    fontWeight: '800',
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  trustText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },

  // Summary
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#3C3C43',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1D1D1F',
  },
  freeShippingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    padding: 8,
    borderRadius: 6,
    marginVertical: 8,
  },
  freeShippingText: {
    fontSize: 12,
    color: '#27AE60',
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E74C3C',
  },
  vatNote: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },

  // Bottom Action
  bottomContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 34, // Safe area
    borderTopWidth: 0.5,
    borderTopColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 12,
  },
  stickySummaryRow: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  stickySummaryLeft: {
    flex: 1,
    gap: 8,
    alignItems: 'center',
  },
  savingsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  savingsPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16A34A',
  },
  etaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  etaPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textAlign: 'right',
    flexShrink: 1,
  },
  placeOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E74C3C',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#E74C3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  placeOrderButtonDisabled: {
    backgroundColor: '#BDC3C7',
    shadowOpacity: 0,
    elevation: 0,
  },
  placeOrderButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
});

const flagStyles = StyleSheet.create({
  flagBox: {
    width: 26,
    height: 18,
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#ffffff',
    position: 'relative',
  },

  // UAE
  uaeRed: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '24%',
    backgroundColor: '#CE1126',
  },
  uaeRight: {
    position: 'absolute',
    left: '24%',
    top: 0,
    bottom: 0,
    right: 0,
  },
  uaeStripe: {
    flex: 1,
  },

  // Abu Dhabi
  abuDhabiCanton: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '40%',
    height: '45%',
    backgroundColor: '#FFFFFF',
  },

  // Dubai / Ajman / UAQ hoist stripe
  hoistWhiteStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '18%',
    backgroundColor: '#FFFFFF',
  },

  // Sharjah / Ras Al Khaimah
  centerRedRect: {
    position: 'absolute',
    left: '16%',
    top: '18%',
    width: '68%',
    height: '64%',
    backgroundColor: '#D81E05',
  },

  // Umm Al Quwain (approx crescent + star)
  uaqCrescentOuter: {
    position: 'absolute',
    left: '46%',
    top: '30%',
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  uaqCrescentInner: {
    position: 'absolute',
    left: '50%',
    top: '30%',
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#D81E05',
  },
  uaqStar: {
    position: 'absolute',
    left: '58%',
    top: '28%',
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: '700',
    backgroundColor: 'transparent',
  },
});

