import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../../contexts/LocalizationContext';
import EmirateFlagIcon from './EmirateFlagIcon';
import { formatEmirateLabel } from '../../utils/emirateUtils';
import { colors, surfaces } from '../../utils/theme';
import {
  isValidEmail,
  formatUaeNationalForInput,
  normalizeUaeToNationalDigits,
  isValidUaeMobileNational,
} from '../../utils/checkoutFormUtils';

/**
 * CheckoutAddressForm
 *
 * Renders the delivery/shipping address section of checkout:
 * - Saved address picker (modal)
 * - Name, email, phone, address, landmark fields
 * - Emirate selection grid
 *
 * All field state is owned by the parent (CheckoutScreen) and threaded
 * through props so this component stays presentational + local-UI-state.
 */
export default function CheckoutAddressForm({
  // Form values
  firstName,
  lastName,
  email,
  phoneNational,
  address,
  landmark,
  // Setters
  setFirstName,
  setLastName,
  setEmail,
  setPhoneNational,
  setAddress,
  setLandmark,
  // Validation
  errors,
  showError,
  // Saved address
  savedAddresses,
  selectedSavedAddressId,
  savedAddressPickerOpen,
  setSavedAddressPickerOpen,
  applySavedAddress,
  clearSavedAddressSelection,
  loadSavedAddresses,
  getSavedTypeLabel,
  // Emirate
  selectedEmirate,
  setSelectedEmirate,
  availableEmirates,
  deliveryEtaText,
  hasFreeShipping,
  totals,
  triggerEmirateHaptic,
  // Touch / focus
  setTouched,
  registerFieldLayout,
  registerSectionLayout,
  firstNameRef,
  lastNameRef,
  emailRef,
  phoneRef,
  addressRef,
  // Styles
  styles,
  // Navigation
  onNavigateToAddresses,
  // Maps
  openAddressInMaps,
}) {
  const { t, dir } = useLocalization();
  const isRTL = dir === 'rtl';

  return (
    <>
      <View style={styles.section} onLayout={registerSectionLayout('delivery')}>
        <View style={[styles.sectionHeader, isRTL && styles.sectionHeaderRTL]}>
          <View style={[surfaces.iconTile, { backgroundColor: colors.accent }]}>
            <Ionicons name="location" size={17} color={colors.white} />
          </View>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>{t('checkout.shippingInformation')}</Text>
        </View>

        {/* Saved address selector */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, isRTL && styles.textRTL]}>{t('checkout.savedAddress')}</Text>
          <TouchableOpacity
            style={[styles.selectInput, isRTL && styles.selectInputRTL]}
            activeOpacity={0.8}
            onPress={async () => {
              await loadSavedAddresses();
              setSavedAddressPickerOpen(true);
            }}
          >
            <Text
              style={[
                styles.selectText,
                isRTL && styles.textRTL,
                !selectedSavedAddressId && styles.selectPlaceholder,
              ]}
              numberOfLines={1}
            >
              {selectedSavedAddressId
                ? (() => {
                    const found = savedAddresses.find((a) => String(a?.id) === String(selectedSavedAddressId));
                    if (!found) return t('checkout.selectSavedAddress');
                    const label = getSavedTypeLabel(found.type);
                    const addrLine = String(found.address || '').trim();
                    return `${label}${found.isDefault ? ' • ' + t('addresses.default') : ''} — ${addrLine}`;
                  })()
                : t('checkout.selectSavedAddress')}
            </Text>
            <Ionicons
              name={isRTL ? 'chevron-back' : 'chevron-forward'}
              size={18}
              color={colors.secondaryLabel}
            />
          </TouchableOpacity>
        </View>

        {/* First / Last name row */}
        <View style={[styles.formRow, isRTL && styles.formRowRTL]}>
          <View style={styles.formHalf} onLayout={registerFieldLayout('firstName')}>
            <Text style={[styles.label, isRTL && styles.textRTL]}>{t('checkout.firstName')} *</Text>
            <TextInput
              style={[styles.input, isRTL && styles.inputRTL, showError('firstName') && styles.inputError]}
              value={firstName}
              onChangeText={(v) => {
                if (selectedSavedAddressId) clearSavedAddressSelection();
                setFirstName(v);
              }}
              placeholder={t('checkout.enterFirstName')}
              autoCapitalize="words"
              autoComplete="given-name"
              textContentType="givenName"
              onBlur={() => setTouched((p) => ({ ...p, firstName: true }))}
              ref={firstNameRef}
              returnKeyType="next"
              onSubmitEditing={() => lastNameRef.current?.focus?.()}
            />
            {showError('firstName') ? <Text style={[styles.helperError, isRTL && styles.helperErrorRTL]}>{errors.firstName}</Text> : null}
          </View>
          <View style={styles.formHalf} onLayout={registerFieldLayout('lastName')}>
            <Text style={[styles.label, isRTL && styles.textRTL]}>{t('checkout.lastName')} *</Text>
            <TextInput
              style={[styles.input, isRTL && styles.inputRTL, showError('lastName') && styles.inputError]}
              value={lastName}
              onChangeText={(v) => {
                if (selectedSavedAddressId) clearSavedAddressSelection();
                setLastName(v);
              }}
              placeholder={t('checkout.enterLastName')}
              autoCapitalize="words"
              autoComplete="family-name"
              textContentType="familyName"
              onBlur={() => setTouched((p) => ({ ...p, lastName: true }))}
              ref={lastNameRef}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus?.()}
            />
            {showError('lastName') ? <Text style={[styles.helperError, isRTL && styles.helperErrorRTL]}>{errors.lastName}</Text> : null}
          </View>
        </View>

        {/* Email */}
        <View style={styles.formGroup} onLayout={registerFieldLayout('email')}>
          <Text style={[styles.label, isRTL && styles.textRTL]}>{t('checkout.emailAddress')} *</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={[
                styles.input,
                styles.inputWithRightIcon,
                isRTL && styles.inputRTL,
                isRTL && styles.inputValueLTR,
                showError('email') && styles.inputError,
              ]}
              value={email}
              onChangeText={setEmail}
              placeholder={t('checkout.enterEmail')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              onBlur={() => setTouched((p) => ({ ...p, email: true }))}
              ref={emailRef}
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus?.()}
            />
            {isValidEmail(email) ? (
              <View style={styles.inputRightIcon}>
                <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
              </View>
            ) : null}
          </View>
          {showError('email') ? <Text style={[styles.helperError, isRTL && styles.helperErrorRTL]}>{errors.email}</Text> : null}
        </View>

        {/* Phone */}
        <View style={styles.formGroup} onLayout={registerFieldLayout('phone')}>
          <Text style={[styles.label, isRTL && styles.textRTL]}>{t('checkout.phoneNumber')} *</Text>
          <View style={[styles.phoneRow, isRTL && styles.phoneRowRTL]}>
            <View style={styles.phonePrefix}>
              <Text style={styles.phonePrefixText}>+971</Text>
            </View>
            <View style={[styles.inputWrap, { flex: 1 }]}>
              <TextInput
                style={[
                  styles.input,
                  styles.inputWithRightIcon,
                  isRTL && styles.inputRTL,
                  isRTL && styles.inputValueLTR,
                  showError('phone') && styles.inputError,
                ]}
                value={formatUaeNationalForInput(phoneNational)}
                onChangeText={(text) => {
                  if (selectedSavedAddressId) clearSavedAddressSelection();
                  setPhoneNational(normalizeUaeToNationalDigits(text));
                }}
                placeholder={t('checkout.enterPhone')}
                keyboardType="phone-pad"
                autoComplete="tel-national"
                textContentType="telephoneNumber"
                onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
                ref={phoneRef}
                returnKeyType="next"
                onSubmitEditing={() => addressRef.current?.focus?.()}
              />
              {isValidUaeMobileNational(phoneNational) ? (
                <View style={styles.inputRightIcon}>
                  <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                </View>
              ) : null}
            </View>
          </View>
          {showError('phone') ? <Text style={[styles.helperError, isRTL && styles.helperErrorRTL]}>{errors.phone}</Text> : null}
        </View>

        {/* Address + Landmark */}
        <View style={styles.formGroup} onLayout={registerFieldLayout('address')}>
          <Text style={[styles.label, isRTL && styles.textRTL]}>{t('checkout.deliveryAddress')} *</Text>
          <TextInput
            style={[styles.input, styles.textArea, isRTL && styles.inputRTL, showError('address') && styles.inputError]}
            value={address}
            onChangeText={(text) => {
              if (selectedSavedAddressId) clearSavedAddressSelection();
              setAddress(text);
            }}
            placeholder={t('checkout.enterAddress')}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            autoComplete="street-address"
            textContentType="fullStreetAddress"
            onBlur={() => setTouched((p) => ({ ...p, address: true }))}
            ref={addressRef}
          />
          {showError('address') ? <Text style={[styles.helperError, isRTL && styles.helperErrorRTL]}>{errors.address}</Text> : null}

          <View style={styles.landmarkWrap}>
            <Text style={[styles.label, isRTL && styles.textRTL]}>{t('checkout.landmarkOptional')}</Text>
            <TextInput
              style={[styles.input, isRTL && styles.inputRTL]}
              value={landmark}
              onChangeText={setLandmark}
              placeholder={t('checkout.landmarkPlaceholder')}
              returnKeyType="done"
            />
          </View>
        </View>

        {/* Emirate selector */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, isRTL && styles.textRTL]}>{t('checkout.emirate')} *</Text>
          <Text style={[styles.deliveryEtaHint, isRTL && styles.textRTL]}>{deliveryEtaText}</Text>
          <View style={[styles.emirateGrid, isRTL && styles.emirateGridRTL]}>
            {availableEmirates.map((emirate) => (
              <TouchableOpacity
                key={emirate.name}
                style={[
                  styles.emirateOption,
                  selectedEmirate === emirate.name && styles.emirateOptionSelected
                ]}
                onPress={async () => {
                  await triggerEmirateHaptic();
                  setSelectedEmirate(emirate.name);
                }}
              >
                <View style={[styles.emirateTopRow, isRTL && styles.rowRTL]}>
                  <View style={[styles.emirateTopLeft, isRTL && styles.emirateTopLeftRTL]}>
                    <EmirateFlagIcon name={emirate.name} />
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={[
                        styles.emirateText,
                        isRTL && styles.textRTL,
                        selectedEmirate === emirate.name && styles.emirateTextSelected,
                      ]}
                    >
                      {formatEmirateLabel(t, emirate.name)}
                    </Text>
                  </View>
                  {selectedEmirate === emirate.name ? (
                    <Ionicons name="checkmark" size={16} color={colors.accent} />
                  ) : null}
                </View>
                <View style={[styles.emirateBottomRow, isRTL && styles.emirateBottomRowRTL]}>
                  {(!!totals?.hasFreeShipping || Number(emirate.shippingCost) === 0) ? (
                    <View style={styles.freeBadge}>
                      <Text style={[styles.freeBadgeText, isRTL && styles.textRTL]}>{t('common.free')}</Text>
                    </View>
                  ) : (
                    <Text style={[styles.emirateShipping, isRTL && styles.textRTL]}>AED {emirate.shippingCost}</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Saved Address Picker Modal */}
      <Modal
        visible={savedAddressPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSavedAddressPickerOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, isRTL && styles.modalCardRTL]}>
            <View style={[styles.modalHeader, isRTL && styles.modalHeaderRTL]}>
              <Text style={[styles.modalTitle, isRTL && styles.textRTL]}>{t('checkout.savedAddress')}</Text>
              <TouchableOpacity
                onPress={() => setSavedAddressPickerOpen(false)}
                style={styles.modalCloseButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
              >
                <Ionicons name="close" size={22} color={colors.label} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.modalOption, isRTL && styles.modalOptionRTL]}
              onPress={() => {
                clearSavedAddressSelection();
                setSavedAddressPickerOpen(false);
              }}
            >
              <Text style={[styles.modalOptionText, isRTL && styles.textRTL]}>{t('checkout.enterManually')}</Text>
            </TouchableOpacity>

            <View style={styles.modalDivider} />

            <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
              {Array.isArray(savedAddresses) && savedAddresses.length > 0 ? (
                savedAddresses.map((a, idx) => {
                  const id = String(a?.id || '');
                  const label = getSavedTypeLabel(a?.type);
                  const addrLine = String(a?.address || '').trim();
                  const meta = [String(a?.city || '').trim(), String(a?.emirate || '').trim()].filter(Boolean).join(', ');
                  return (
                    <TouchableOpacity
                      key={id || `addr_${idx}`}
                      style={[
                        styles.modalAddressRow,
                        isRTL && styles.modalAddressRowRTL,
                        selectedSavedAddressId && String(selectedSavedAddressId) === id ? styles.modalAddressRowActive : null,
                      ]}
                      onPress={() => {
                        applySavedAddress(a);
                        setSavedAddressPickerOpen(false);
                      }}
                    >
                      <Text style={[styles.modalAddressType, isRTL && styles.textRTL]}>
                        {label}{a?.isDefault ? ` • ${t('addresses.default')}` : ''}
                      </Text>
                      {a?.name ? <Text style={[styles.modalAddressName, isRTL && styles.textRTL]}>{String(a.name)}</Text> : null}
                      <Text style={[styles.modalAddressLine, isRTL && styles.textRTL]} numberOfLines={2}>{addrLine}</Text>
                      {meta ? <Text style={[styles.modalAddressMeta, isRTL && styles.textRTL]}>{meta}</Text> : null}
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={{ padding: 10 }}>
                  <Text style={[styles.modalAddressLine, { color: colors.mutedText }, isRTL && styles.textRTL]}>{t('addresses.emptyTitle')}</Text>
                  <TouchableOpacity
                    style={[styles.modalOption, { paddingHorizontal: 0 }, isRTL && styles.modalOptionRTL]}
                    onPress={() => {
                      setSavedAddressPickerOpen(false);
                      onNavigateToAddresses();
                    }}
                  >
                    <Text style={[styles.modalOptionText, isRTL && styles.textRTL]}>{t('addresses.addNew')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
