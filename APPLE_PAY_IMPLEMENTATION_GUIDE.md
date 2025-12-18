# Apple Pay Implementation Guide for Genosys Mobile App

## Status: ✅ Prerequisites Complete

- [x] Apple Developer Merchant ID created: `merchant.ae.genosys.app`
- [x] App ID configured with Apple Pay capability
- [x] app.json updated with Merchant ID
- [x] Packages installed: `@stripe/stripe-react-native`, `react-native-svg`
- [x] ApplePayButton component created
- [x] applePayService created

---

## Next Steps: Integration

### 1. Update Payment Methods Constants

**File:** `services/paymentPreferences.js`

Add Apple Pay to the payment methods:

```javascript
export const PAYMENT_METHODS = {
  COD: 'cod',
  CARD: 'card',
  APPLE_PAY: 'apple_pay', // ADD THIS
};
```

---

### 2. Add Apple Pay Backend Endpoints

You need to create two new backend endpoints in your cosmetics-website:

#### a) Create Payment Intent

**File:** `cosmetics-website/app/api/mobile/checkout/apple-pay/create-intent/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { validateMobileAuth } from '@/lib/jwt';
import { debugLog, errorLog } from '@/lib/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key');
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const authValidation = validateMobileAuth(apiKey, token);
    
    if (!authValidation.valid) {
      return NextResponse.json(
        { success: false, error: authValidation.error },
        { status: authValidation.status || 401 }
      );
    }

    const body = await request.json();
    const { amount, currency, items, customerInfo, orderNotes } = body;

    debugLog('[ApplePay] Creating payment intent', {
      amount,
      customerEmail: customerInfo.email,
      itemCount: items?.length || 0,
    });

    // Create or find customer
    let customer = await stripe.customers.list({
      email: customerInfo.email,
      limit: 1,
    });

    let customerId;
    if (customer.data.length === 0) {
      const newCustomer = await stripe.customers.create({
        email: customerInfo.email,
        name: customerInfo.name,
        phone: customerInfo.phone,
        address: {
          line1: customerInfo.address || 'N/A',
          country: 'AE',
        },
      });
      customerId = newCustomer.id;
      debugLog('[ApplePay] Created new Stripe customer', { customerId });
    } else {
      customerId = customer.data[0].id;
      debugLog('[ApplePay] Using existing Stripe customer', { customerId });
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount in fils (AED cents)
      currency: currency || 'aed',
      customer: customerId,
      payment_method_types: ['card'], // Apple Pay uses card payment method
      metadata: {
        source: 'mobile_app_apple_pay',
        userId: authValidation.user!.id,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        customerAddress: customerInfo.address,
        emirate: customerInfo.emirate || 'Dubai',
        orderNotes: orderNotes || '',
        itemsJson: JSON.stringify(items),
      },
    });

    debugLog('[ApplePay] PaymentIntent created', {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      customerId,
    });

  } catch (error) {
    errorLog('[ApplePay] Create intent error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
```

#### b) Confirm Payment & Create Order

**File:** `cosmetics-website/app/api/mobile/checkout/apple-pay/confirm/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { validateMobileAuth } from '@/lib/jwt';
import { debugLog, errorLog } from '@/lib/logger';
import { createOrder } from '@/lib/orderStorageDb';
import { generateOrderNumber } from '@/lib/orderNumber';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key');
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const authValidation = validateMobileAuth(apiKey, token);
    
    if (!authValidation.valid) {
      return NextResponse.json(
        { success: false, error: authValidation.error },
        { status: authValidation.status || 401 }
      );
    }

    const body = await request.json();
    const { paymentIntentId } = body;

    debugLog('[ApplePay] Confirming payment', { paymentIntentId });

    // Retrieve the payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      errorLog('[ApplePay] Payment not succeeded', {
        status: paymentIntent.status,
        paymentIntentId,
      });
      return NextResponse.json(
        { success: false, error: `Payment status: ${paymentIntent.status}` },
        { status: 400 }
      );
    }

    // Extract data from payment intent metadata
    const items = JSON.parse(paymentIntent.metadata.itemsJson || '[]');
    const userId = paymentIntent.metadata.userId;
    const customerName = paymentIntent.metadata.customerName;
    const customerEmail = paymentIntent.metadata.customerEmail;
    const customerPhone = paymentIntent.metadata.customerPhone;
    const customerAddress = paymentIntent.metadata.customerAddress;
    const emirate = paymentIntent.metadata.emirate || 'Dubai';
    const orderNotes = paymentIntent.metadata.orderNotes || null;

    // Generate order number
    const orderNumber = generateOrderNumber('apple_pay', customerName, emirate);

    // Calculate totals from items
    const subtotal = items.reduce((sum: number, item: any) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    const total = paymentIntent.amount / 100; // Convert from fils to AED

    // Create order in database
    const order = await createOrder({
      orderNumber,
      userId,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      emirate,
      items,
      subtotal,
      shippingCost: total - subtotal, // Calculate shipping from difference
      vatAmount: 0, // VAT already included in total
      total,
      paymentMethod: 'apple_pay',
      paymentStatus: 'paid',
      stripePaymentIntentId: paymentIntent.id,
      orderNotes,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    debugLog('[ApplePay] Order created', {
      orderId: order.id,
      orderNumber,
      total,
    });

    return NextResponse.json({
      success: true,
      order,
      orderNumber,
      message: 'Payment successful',
    });

  } catch (error) {
    errorLog('[ApplePay] Confirm error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}
```

---

### 3. Modify Checkout Screen

Due to the checkout.js file being 1515 lines, here are the specific changes needed:

#### a) Add imports at the top:

```javascript
import { initializeStripe, checkApplePayAvailability, presentApplePaySheet } from '../services/applePayService';
import ApplePayButton from '../components/ApplePayButton';
```

#### b) Add state for Apple Pay:

```javascript
const [applePayAvailable, setApplePayAvailable] = useState(false);
```

#### c) Initialize Stripe and check Apple Pay availability:

```javascript
useEffect(() => {
  (async () => {
    await initializeStripe();
    const isAvailable = await checkApplePayAvailability();
    setApplePayAvailable(isAvailable);
  })();
}, []);
```

#### d) Update PAYMENT_METHODS constant usage:

In the `selectPaymentMethod` function (around line 139), update to:

```javascript
const selectPaymentMethod = async (method) => {
  const safe =
    method === PAYMENT_METHODS.APPLE_PAY
      ? PAYMENT_METHODS.APPLE_PAY
      : method === PAYMENT_METHODS.CARD
      ? PAYMENT_METHODS.CARD
      : PAYMENT_METHODS.COD;
  setSelectedPaymentMethod(safe);
  try {
    await setDefaultPaymentMethod(safe);
  } catch {
    // ignore preference save failures
  }
};
```

#### e) Add Apple Pay payment option in the UI:

Insert this AFTER the Card Payment option (after line 734):

```javascript
{/* Apple Pay Option - iOS Only */}
{Platform.OS === 'ios' && applePayAvailable && (
  <TouchableOpacity
    style={[
      styles.paymentOption,
      selectedPaymentMethod === PAYMENT_METHODS.APPLE_PAY && styles.paymentOptionSelected
    ]}
    onPress={() => selectPaymentMethod(PAYMENT_METHODS.APPLE_PAY)}
  >
    <View style={styles.paymentOptionHeader}>
      <Ionicons 
        name={selectedPaymentMethod === PAYMENT_METHODS.APPLE_PAY ? "radio-button-on" : "radio-button-off"} 
        size={20} 
        color={selectedPaymentMethod === PAYMENT_METHODS.APPLE_PAY ? "#E74C3C" : "#C7C7CC"} 
      />
      <Text style={styles.paymentTitle}>Apple Pay</Text>
    </View>
    <Text style={styles.paymentDescription}>
      Pay securely with Apple Pay
    </Text>
  </TouchableOpacity>
)}
```

#### f) Add Apple Pay handler function:

Insert this BEFORE the `handleSubmit` function:

```javascript
const handleApplePayPayment = async () => {
  try {
    setIsProcessing(true);
    log.info('Starting Apple Pay payment...');

    // Build customer info
    const customerInfo = {
      name: `${firstName.trim()} ${lastName.trim()}`,
      email: email.trim(),
      phone: toE164UaePhone(phoneNational),
      address: landmark.trim()
        ? `${address.trim()}\nLandmark: ${landmark.trim()}`
        : address.trim(),
      emirate: selectedEmirate,
    };

    // Create payment intent
    const createIntentResponse = await fetch(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/mobile/checkout/apple-pay/create-intent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.EXPO_PUBLIC_API_KEY || '',
          'Authorization': `Bearer ${user?.token || user?.accessToken || ''}`,
        },
        body: JSON.stringify({
          amount: safeTotal * 100, // Convert to fils
          currency: 'aed',
          items: items,
          customerInfo,
          orderNotes: orderNotes.trim(),
        }),
      }
    );

    const intentData = await createIntentResponse.json();

    if (!intentData.success || !intentData.clientSecret) {
      throw new Error('Failed to create payment intent');
    }

    log.info('Payment intent created', {
      paymentIntentId: intentData.paymentIntentId,
    });

    // Present Apple Pay sheet
    const result = await presentApplePaySheet({
      clientSecret: intentData.clientSecret,
      cartItems: items,
      totalAmount: safeTotal,
      customerInfo,
    });

    if (!result.success) {
      throw new Error(result.error?.message || 'Apple Pay failed');
    }

    log.info('Apple Pay payment successful');

    // Confirm payment and create order
    const confirmResponse = await fetch(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/mobile/checkout/apple-pay/confirm`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.EXPO_PUBLIC_API_KEY || '',
          'Authorization': `Bearer ${user?.token || user?.accessToken || ''}`,
        },
        body: JSON.stringify({
          paymentIntentId: intentData.paymentIntentId,
        }),
      }
    );

    const confirmData = await confirmResponse.json();

    if (confirmData.success) {
      clearCart();
      Alert.alert(
        t('checkout.orderSubmittedTitle'),
        t('checkout.orderSubmittedMessageCard', {
          orderNumber: confirmData.orderNumber,
        }),
        [
          {
            text: t('checkout.viewOrder'),
            onPress: () => router.replace('/(tabs)/orders'),
            style: 'default',
          },
        ],
        { cancelable: false }
      );
    } else {
      throw new Error(confirmData.error || 'Order creation failed');
    }

  } catch (error) {
    log.error('Apple Pay payment failed', error);
    Alert.alert(
      t('checkout.paymentFailed'),
      error.message || 'Please try again',
      [{ text: t('common.ok'), style: 'default' }]
    );
  } finally {
    setIsProcessing(false);
  }
};
```

#### g) Update the handleSubmit function:

Add this check at the beginning of `handleSubmit`:

```javascript
const handleSubmit = async () => {
  // ... existing validation code ...

  // If Apple Pay is selected, use Apple Pay flow
  if (selectedPaymentMethod === PAYMENT_METHODS.APPLE_PAY) {
    await handleApplePayPayment();
    return;
  }

  // ... rest of existing code ...
};
```

---

### 4. Add Apple Pay to paymentPreferences.js

**File:** `services/paymentPreferences.js`

Update the `PAYMENT_METHODS` constant:

```javascript
export const PAYMENT_METHODS = {
  COD: 'cod',
  CARD: 'card',
  APPLE_PAY: 'apple_pay', // NEW
};
```

---

### 5. Add Translations

Add Apple Pay translations to your i18n files:

**English (i18n/messages/en.json):**
```json
{
  "checkout": {
    "applePayTitle": "Apple Pay",
    "applePayDescription": "Pay securely with Apple Pay"
  }
}
```

**Arabic (i18n/messages/ar.json):**
```json
{
  "checkout": {
    "applePayTitle": "Apple Pay",
    "applePayDescription": "ادفع بأمان باستخدام Apple Pay"
  }
}
```

**Russian (i18n/messages/ru.json):**
```json
{
  "checkout": {
    "applePayTitle": "Apple Pay",
    "applePayDescription": "Безопасная оплата через Apple Pay"
  }
}
```

---

### 6. Update .env File

Add Stripe keys to your `.env` file:

```env
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
# Or for production:
# EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key_here
```

---

### 7. Testing Checklist

- [ ] Build app with EAS (new Apple Pay capability will be included)
- [ ] Test on real iOS device (Apple Pay doesn't work in simulator)
- [ ] Add a test card to Apple Wallet
- [ ] Navigate to checkout
- [ ] Verify Apple Pay option appears (iOS only)
- [ ] Select Apple Pay
- [ ] Click "Place Order"
- [ ] Verify Apple Pay sheet appears
- [ ] Complete payment
- [ ] Verify order created in database
- [ ] Verify order appears in orders list
- [ ] Check Stripe dashboard for payment

---

## Summary of Changes

### Files Created:
1. ✅ `components/ApplePayButton.js` (Black button with Apple logo)
2. ✅ `services/applePayService.js` (Stripe initialization & payment flow)
3. ⏳ `cosmetics-website/app/api/mobile/checkout/apple-pay/create-intent/route.ts`
4. ⏳ `cosmetics-website/app/api/mobile/checkout/apple-pay/confirm/route.ts`

### Files to Modify:
1. ⏳ `app/checkout.js` (Add Apple Pay option and handler)
2. ⏳ `services/paymentPreferences.js` (Add APPLE_PAY constant)
3. ⏳ `i18n/messages/*.json` (Add translations)
4. ⏳ `.env` (Add Stripe publishable key)

---

Would you like me to implement these changes now? Just say "yes" and I'll make all the modifications!
