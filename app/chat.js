/**
 * Chat Screen - AI Chatbot "Genie"
 * Full-screen chat with product card rendering, quick action buttons,
 * contextual greetings, and Add to Bag. Aligned with mobile web ChatWidget.
 */

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, shadow, surfaces } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { sendChatMessage, segmentChatResponse } from '../services/chatService';
import { fetchProductById } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { getLocalizedProductName } from '../utils/productLocalization';
import { getPricingDisplay, formatAed } from '../utils/pricingDisplay';
import { isProductOptionSelectionRequired } from '../utils/productOptions';
import { handleDeepLink } from '../utils/deepLinking';
import * as haptics from '../utils/haptics';
import AUTH_CONFIG from '../config/auth';
import T from '../utils/typography';
import { ASSET_ORIGIN } from '../utils/assets';
import { buildQuickActionRows } from '../utils/chatQuickActions';
import { openWhatsApp } from '../utils/support';


/** Get user context for personalised greetings (mirrors web getUserContext) */
function getUserContext() {
  const now = new Date();
  const hour = now.getHours();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });

  let timeOfDay;
  if (hour >= 5 && hour < 12) timeOfDay = 'morning';
  else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
  else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
  else timeOfDay = 'night';

  // UAE weekend = Friday / Saturday
  const isWeekend = dayName === 'Friday' || dayName === 'Saturday';

  return { timeOfDay, dayOfWeek: dayName, isWeekend };
}

/** Build the welcome message from i18n keys + time context */
function buildWelcome(t, ctx) {
  const greetingKey = {
    morning: 'chat.greetingMorning',
    afternoon: 'chat.greetingAfternoon',
    evening: 'chat.greetingEvening',
    night: 'chat.greetingNight',
  }[ctx.timeOfDay] || 'chat.greetingAfternoon';

  let contextKey;
  if (ctx.isWeekend) {
    contextKey = 'chat.contextWeekend';
  } else {
    contextKey = {
      morning: 'chat.contextMorning',
      afternoon: 'chat.contextAfternoon',
      evening: 'chat.contextEvening',
      night: 'chat.contextNight',
    }[ctx.timeOfDay] || 'chat.contextAfternoon';
  }

  const greeting = t(greetingKey);
  const context = t(contextKey);
  const body = t('chat.welcome');

  return `${greeting} ${context}\n\n${body}`;
}

export default function ChatScreen() {
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const { user } = useAuth();
  const { addItem } = useCart();
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const userContext = useMemo(() => getUserContext(), []);
  const welcomeText = useMemo(() => buildWelcome(t, userContext), [t, userContext]);

  const [messages, setMessages] = useState([
    { role: 'assistant', content: welcomeText },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [productCache, setProductCache] = useState({});
  const [addedProducts, setAddedProducts] = useState(new Set());

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  /* ─── Quick-action definitions (same 10 as mobile web, arranged in rows of 3-3-2-2) ─── */
  const [QUICK_ACTIONS_ROW1, QUICK_ACTIONS_ROW2, QUICK_ACTIONS_ROW3, QUICK_ACTIONS_ROW4] =
    useMemo(() => buildQuickActionRows(t), [t]);

  /* ─── Chat API ─── */
  const handleSend = async (overrideText) => {
    haptics.lightTap();
    const text = (overrideText || input).trim();
    if (!text || loading) return;
    Keyboard.dismiss();

    const userMsg = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const apiMessages = updatedMessages
        .filter((m) => m.role === 'user' || (m.role === 'assistant' && m !== messages[0]))
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await sendChatMessage(apiMessages, locale);

      if (response === '__RATE_LIMITED__') {
        setMessages((prev) => [...prev, { role: 'assistant', content: t('chat.rateLimited') }]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
        prefetchProducts(response);
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: t('chat.errorMessage') }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (query) => {
    handleSend(query);
  };

  const prefetchProducts = async (text) => {
    const segments = segmentChatResponse(text);
    for (const seg of segments) {
      if (seg.type === 'product' && productCache[seg.content] === undefined) {
        try {
          const product = await fetchProductById(seg.content, user);
          // null marks "fetch failed / product gone" so the card renders
          // nothing instead of an infinite loading spinner.
          setProductCache((prev) => ({ ...prev, [seg.content]: product || null }));
        } catch {
          setProductCache((prev) => ({ ...prev, [seg.content]: null }));
        }
      }
    }
  };

  const handleAddToBag = async (product) => {
    haptics.mediumTap();
    if (!product || addedProducts.has(product.id) || product.isPriceOnRequest) return;
    if (isProductOptionSelectionRequired(product)) {
      router.push(`/product/${product.id}`);
      return;
    }
    try {
      await addItem(product, 1, '', '');
      setAddedProducts((prev) => new Set([...prev, product.id]));
      setTimeout(() => {
        setAddedProducts((prev) => {
          const next = new Set(prev);
          next.delete(product.id);
          return next;
        });
      }, 2000);
    } catch {
      // silent
    }
  };

  /* ─── Product card renderer ─── */
  const renderProductCard = (productId) => {
    const product = productCache[productId];
    // null = fetch failed (product removed from catalog) → render nothing
    if (product === null) return null;
    if (!product) {
      return (
        <View style={styles.productCardLoading} key={`prod-${productId}`}>
          <ActivityIndicator size="small" color={colors.accent} />
        </View>
      );
    }

    const name = getLocalizedProductName(product, locale) || product.name || '';
    const pricing = getPricingDisplay(product);
    const price = pricing.displayPrice;
    const imageUri = product.image ? `${ASSET_ORIGIN}${product.image}` : null;
    const isAdded = addedProducts.has(product.id);

    return (
      <View style={styles.productCard} key={`prod-${productId}`}>
        {imageUri ? (
          <Image source={imageUri} style={styles.productImage} contentFit="contain" transition={200} cachePolicy="memory-disk" />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <Ionicons name="bag-outline" size={24} color={colors.separatorStrong} />
          </View>
        )}
        <View style={styles.productInfo}>
          <Text style={[styles.productName, isRTL && styles.textRTL]} numberOfLines={2}>
            {name}
          </Text>
          {pricing.isPriceOnRequest ? (
            <Text style={styles.productPriceOnRequest}>{t('product.priceOnRequest')}</Text>
          ) : (
            <Text style={styles.productPrice}>{formatAed(price)}</Text>
          )}
          <View style={styles.productActions}>
            {pricing.isPriceOnRequest ? (
              <TouchableOpacity
                style={styles.requestQuoteBtn}
                onPress={() => {
                  const msg = t('product.requestQuoteMessage', { name });
                  openWhatsApp(msg);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-whatsapp" size={14} color={colors.white} />
                <Text style={styles.addToBagText}>{t('product.requestQuote')}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.addToBagBtn, isAdded && styles.addToBagBtnAdded]}
                onPress={() => handleAddToBag(product)}
                activeOpacity={0.8}
                disabled={isAdded}
              >
                <Ionicons name={isAdded ? 'checkmark' : 'bag-add-outline'} size={14} color={colors.white} />
                <Text style={styles.addToBagText}>
                  {isAdded ? t('chat.added') : t('chat.addToBag')}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.viewProductBtn}
              onPress={() => { haptics.lightTap(); router.push({ pathname: '/product/[id]', params: { id: product.id } }); }}
              activeOpacity={0.8}
            >
              <Text style={styles.viewProductText}>{t('chat.viewProduct')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  /* ─── Quick-action button component ─── */
  const renderQuickActionButton = (item, index) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.quickActionBtn,
        item.highlight && styles.quickActionBtnHighlight,
      ]}
      onPress={() => handleQuickAction(item.query)}
      activeOpacity={0.8}
    >
      {item.emoji ? <Text style={styles.quickActionEmoji}>{item.emoji}</Text> : null}
      <Text
        style={[
          styles.quickActionLabel,
          item.highlight && styles.quickActionLabelHighlight,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  /* ─── Handle link press: open genosys.ae URLs in-app, others externally ─── */
  const handleLinkPress = useCallback((url) => {
    if (!url) return;
    // If it's a genosys.ae URL, try to navigate in-app
    if (url.includes('genosys.ae')) {
      const handled = handleDeepLink(url);
      if (!handled) {
        // Fallback: open in WebView inside the app
        router.push({ pathname: '/webview', params: { url, title: '' } });
      }
    } else {
      // External URL — open in browser
      Linking.openURL(url).catch(() => {});
    }
  }, []);

  /* ─── Text with clickable links ─── */
  const renderLinkedText = (text, baseStyle) => {
    // Match markdown links [label](url) and bare URLs https://...
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s)]+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
      }
      if (match[1] && match[2]) {
        // Markdown link: [label](url)
        parts.push({ type: 'link', label: match[1], url: match[2] });
      } else if (match[3]) {
        // Bare URL
        parts.push({ type: 'link', label: match[3], url: match[3] });
      }
      lastIndex = match.index + match[0].length;
    }
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.slice(lastIndex) });
    }

    // If no links found, return plain text
    if (parts.length === 0 || (parts.length === 1 && parts[0].type === 'text')) {
      return <Text style={baseStyle}>{text}</Text>;
    }

    return (
      <Text style={baseStyle}>
        {parts.map((part, i) =>
          part.type === 'link' ? (
            <Text
              key={i}
              style={styles.linkText}
              onPress={() => handleLinkPress(part.url)}
            >
              {part.label}
            </Text>
          ) : (
            <Text key={i}>{part.content}</Text>
          )
        )}
      </Text>
    );
  };

  /* ─── Message renderer ─── */
  const renderMessage = (msg, index) => {
    const isUser = msg.role === 'user';
    const isWelcome = !isUser && index === 0;
    const segments = isUser ? [{ type: 'text', content: msg.content }] : segmentChatResponse(msg.content);

    return (
      <View key={index}>
        <View
          style={[
            styles.messageBubbleWrap,
            isUser ? styles.userBubbleWrap : styles.assistantBubbleWrap,
            isRTL && (isUser ? styles.assistantBubbleWrap : styles.userBubbleWrap),
          ]}
        >
          {!isUser && (
            <View style={styles.avatarCircle}>
              <Ionicons name="sparkles" size={14} color={colors.accent} />
            </View>
          )}
          <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
            {segments.map((seg, i) =>
              seg.type === 'product' ? (
                renderProductCard(seg.content)
              ) : (
                <React.Fragment key={i}>
                  {renderLinkedText(
                    seg.content,
                    [
                      styles.messageText,
                      isUser ? styles.userText : styles.assistantText,
                      isRTL && styles.textRTL,
                    ]
                  )}
                </React.Fragment>
              )
            )}
          </View>
        </View>

        {/* Quick-action buttons after the welcome message */}
        {isWelcome && messages.length === 1 && (
          <View style={styles.quickActionsContainer}>
            {/* Row 1 – skin types */}
            <View style={[styles.quickActionsRow, isRTL && styles.quickActionsRowRTL]}>
              {QUICK_ACTIONS_ROW1.map(renderQuickActionButton)}
            </View>
            {/* Row 2 – skin types + concerns */}
            <View style={[styles.quickActionsRow, isRTL && styles.quickActionsRowRTL]}>
              {QUICK_ACTIONS_ROW2.map(renderQuickActionButton)}
            </View>
            {/* Row 3 – info */}
            <View style={[styles.quickActionsRow, isRTL && styles.quickActionsRowRTL]}>
              {QUICK_ACTIONS_ROW3.map(renderQuickActionButton)}
            </View>
            {/* Row 4 – highlight: discount + AI */}
            <View style={[styles.quickActionsRow, isRTL && styles.quickActionsRowRTL]}>
              {QUICK_ACTIONS_ROW4.map(renderQuickActionButton)}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ─── Header (red, matches web) ─── */}
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <TouchableOpacity
          onPress={() => { haptics.lightTap(); router.back(); }}
          style={styles.backBtn}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerTitleRow}>
            <Ionicons name="sparkles" size={16} color={colors.white} />
            <Text style={styles.headerTitle}>{t('chat.title')}</Text>
          </View>
          <Text style={styles.headerSubtitle}>{t('chat.subtitle')}</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      {/* ─── Messages ─── */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? -34 : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map(renderMessage)}

          {loading && (
            <View style={[styles.messageBubbleWrap, styles.assistantBubbleWrap]}>
              <View style={styles.avatarCircle}>
                <Ionicons name="sparkles" size={14} color={colors.accent} />
              </View>
              <View style={[styles.bubble, styles.assistantBubble]}>
                <View style={styles.typingRow}>
                  <ActivityIndicator size="small" color={colors.accent} />
                  <Text style={styles.typingText}>{t('chat.thinking')}</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* ─── Input ─── */}
        <View style={[styles.inputBar, isRTL && styles.inputBarRTL]}>
          <TextInput
            ref={inputRef}
            style={[styles.input, isRTL && styles.inputRTL]}
            value={input}
            onChangeText={setInput}
            placeholder={t('chat.placeholder')}
            placeholderTextColor={colors.placeholder}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => handleSend()}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => handleSend()}
            disabled={!input.trim() || loading}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={t('chat.send')}
            accessibilityState={{ disabled: !input.trim() || loading }}
          >
            <Ionicons name="send" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.groupedBg },
  flex: { flex: 1 },

  /* ─── Header (red, matches mobile web) ─── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.cta,
  },
  headerRTL: { flexDirection: 'row-reverse' },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerTitle: { ...T.bodySmall, fontWeight: '700', color: colors.white, lineHeight: undefined },
  headerSubtitle: { ...T.captionTiny, color: 'rgba(255,255,255,0.8)', marginTop: 1 },

  /* ─── Messages ─── */
  messageList: { flex: 1 },
  messageListContent: { padding: 16, paddingBottom: 16 },

  messageBubbleWrap: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  userBubbleWrap: { justifyContent: 'flex-end' },
  assistantBubbleWrap: { justifyContent: 'flex-start' },

  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.redBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 8,
    marginBottom: 2,
  },

  bubble: {
    maxWidth: '78%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: {
    backgroundColor: colors.cta,
    borderBottomEndRadius: 4,
  },
  assistantBubble: {
    backgroundColor: colors.card,
    borderBottomStartRadius: 4,
    ...shadow.card,
  },

  messageText: { ...T.bodySmall, color: undefined },
  userText: { color: colors.white },
  assistantText: { color: colors.label },
  linkText: { ...T.link, color: colors.blue, textDecorationLine: 'underline' },
  textRTL: { textAlign: 'right' },

  typingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typingText: { ...T.caption, color: colors.mutedText, fontStyle: 'italic' },

  /* ─── Quick-action buttons ─── */
  quickActionsContainer: {
    marginStart: 36, // align with bubble (avatar 28 + margin 8)
    marginTop: 4,
    marginBottom: 8,
    gap: 8,
  },
  quickActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickActionsRowRTL: {
    flexDirection: 'row-reverse',
  },
  quickActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.fill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
  quickActionBtnHighlight: {
    backgroundColor: colors.cta,
    borderColor: colors.accent,
  },
  quickActionEmoji: {
    fontSize: 13,
  },
  quickActionLabel: {
    ...T.captionSmall,
    fontWeight: '600',
    color: colors.bodyText,
  },
  quickActionLabelHighlight: {
    color: colors.white,
  },

  /* ─── Product card ─── */
  productCard: {
    flexDirection: 'row',
    ...surfaces.card,
    ...shadow.card,
    borderRadius: 12,
    padding: 10,
    marginVertical: 6,
  },
  productCardLoading: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.card,
  },
  productImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.fill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: { flex: 1, marginStart: 10 },
  productName: { ...T.labelSmall, color: colors.label, lineHeight: 18 },
  productPrice: { ...T.labelSmall, fontWeight: '800', color: colors.accent, marginTop: 2 },
  productActions: { flexDirection: 'row', gap: 8, marginTop: 6 },
  addToBagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.cta,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  addToBagBtnAdded: { backgroundColor: colors.greenDeep },
  requestQuoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.whatsappDeep,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  productPriceOnRequest: { ...T.labelSmall, fontWeight: '700', color: colors.whatsappDeep, marginTop: 2 },
  addToBagText: { ...T.captionTiny, fontWeight: '700', color: colors.white },
  viewProductBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.separatorStrong,
  },
  viewProductText: { ...T.captionTiny, fontWeight: '600', color: colors.bodyText },

  /* ─── Input bar ─── */
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: colors.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
  },
  inputBarRTL: { flexDirection: 'row-reverse' },
  input: {
    ...T.input,
    flex: 1,
    color: colors.label,
    backgroundColor: colors.fillSecondary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    maxHeight: 100,
    marginEnd: 8,
    borderWidth: 1,
    borderColor: colors.separator,
  },
  inputRTL: { textAlign: 'right', marginEnd: 0, marginStart: 8 },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: colors.separatorStrong },
});
