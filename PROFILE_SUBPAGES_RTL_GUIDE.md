# Profile Sub-Pages RTL Implementation Guide

## RTL Support Added to Profile Sub-Pages

### Implementation Pattern

For each page, the following changes were made:

1. **Add RTL context**:
```javascript
const { t, dir } = useLocalization();
const isRTL = dir === 'rtl';
```

2. **Update header**:
```javascript
<View style={[styles.header, isRTL && styles.headerRTL]}>
  <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, isRTL && styles.backButtonRTL]}>
    <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={24} color="#dc2626" />
  </TouchableOpacity>
  <Text style={[styles.headerTitle, isRTL && styles.headerTitleRTL]}>{t('page.title')}</Text>
  <View style={styles.placeholder} />
</View>
```

3. **Update text elements**:
```javascript
<Text style={[styles.text, isRTL && styles.textRTL]}>{content}</Text>
```

4. **Add RTL styles**:
```javascript
// RTL Support Styles
headerRTL: {
  flexDirection: 'row-reverse',
},
backButtonRTL: {
  marginRight: 0,
  marginLeft: 'auto',
},
headerTitleRTL: {
  textAlign: 'center',
  writingDirection: 'rtl',
},
textRTL: {
  textAlign: 'right',
  writingDirection: 'rtl',
},
```

## Pages Completed

### ✅ 1. About Genosys (`about.js`)
- Header with RTL navigation
- Hero section with company info
- Legal information cards with RTL text
- Info rows with label/value pairs in RTL
- Footer with RTL text

### 🔄 2. Contact (`contact.js`)  
- RTL context added (`isRTL`)
- Needs: Header, contact cards, buttons, social links

### ⏳ 3. Help (`help.js`)
- Needs: Full RTL implementation

### ⏳ 4. Privacy Policy (`privacy.js`)
- Needs: Full RTL implementation

### ⏳ 5. Terms & Conditions (`terms.js`)
- Needs: Full RTL implementation

### ⏳ 6. Addresses (`addresses.js`)
- Needs: Full RTL implementation

### ⏳ 7. Add Address (`add-address.js`)
- Needs: Full RTL implementation

### ⏳ 8. Edit Profile (`edit.js`)
- Needs: Full RTL implementation

### ⏳ 9. Payment Methods (`payment.js`)
- Needs: Full RTL implementation

## Common RTL Patterns

### Header Pattern
```javascript
// JSX
<View style={[styles.header, isRTL && styles.headerRTL]}>
  <TouchableOpacity style={[styles.backButton, isRTL && styles.backButtonRTL]}>
    <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} />
  </TouchableOpacity>
  <Text style={[styles.title, isRTL && styles.titleRTL]}>{title}</Text>
</View>

// Styles
headerRTL: { flexDirection: 'row-reverse' },
backButtonRTL: { marginRight: 0, marginLeft: 'auto' },
titleRTL: { textAlign: 'center', writingDirection: 'rtl' },
```

### List Item Pattern
```javascript
// JSX
<View style={[styles.item, isRTL && styles.itemRTL]}>
  <View style={[styles.itemLeft, isRTL && styles.itemLeftRTL]}>
    <Text style={[styles.itemText, isRTL && styles.itemTextRTL]}>{text}</Text>
  </View>
  <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} />
</View>

// Styles
itemRTL: { flexDirection: 'row-reverse' },
itemLeftRTL: { flexDirection: 'row-reverse' },
itemTextRTL: { textAlign: 'right', writingDirection: 'rtl' },
```

### Form Input Pattern
```javascript
// JSX
<View style={[styles.inputContainer, isRTL && styles.inputContainerRTL]}>
  <Text style={[styles.label, isRTL && styles.labelRTL]}>{label}</Text>
  <TextInput 
    style={[styles.input, isRTL && styles.inputRTL]}
    textAlign={isRTL ? 'right' : 'left'}
  />
</View>

// Styles
inputContainerRTL: { alignItems: 'flex-end' },
labelRTL: { textAlign: 'right', writingDirection: 'rtl' },
inputRTL: { textAlign: 'right', writingDirection: 'rtl' },
```

### Button Pattern
```javascript
// JSX
<TouchableOpacity style={[styles.button, isRTL && styles.buttonRTL]}>
  <Text style={[styles.buttonText, isRTL && styles.buttonTextRTL]}>{text}</Text>
</TouchableOpacity>

// Styles
buttonRTL: { flexDirection: 'row-reverse' },
buttonTextRTL: { textAlign: 'center' },
```

## Quick Implementation Checklist

For each page:
- [ ] Add `dir` to useLocalization
- [ ] Add `isRTL` constant
- [ ] Update header with RTL navigation
- [ ] Update all text with RTL styles
- [ ] Update all buttons with RTL styles
- [ ] Update all list items with RTL chevrons
- [ ] Update all form inputs with RTL alignment
- [ ] Add RTL styles to StyleSheet
- [ ] Test in Arabic language

## Testing

1. Switch to Arabic (AR) in app
2. Navigate to each profile sub-page
3. Verify:
   - Back button shows forward chevron
   - All text aligns right
   - Arabic text displays properly
   - Buttons work correctly
   - Forms accept Arabic input
   - Layout doesn't break

---

**Status**: 1/9 pages complete (About)
**Next**: Complete Contact, then Help, Privacy, Terms, Addresses, Add Address, Edit, Payment

