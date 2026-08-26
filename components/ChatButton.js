/**
 * Floating Chat Button + Expandable Chat Panel
 * Opens an overlay chat panel (like mobile web) instead of navigating to full-screen.
 * Panel takes ~82% of screen height, anchored to bottom.
 */

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Linking,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { sendChatMessage, segmentChatResponse } from '../services/chatService';
import { fetchProductById } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { getLocalizedProductName } from '../utils/productLocalization';
import { handleDeepLink } from '../utils/deepLinking';
import { getPricingDisplay, formatAed } from '../utils/pricingDisplay';
import { isProductOptionSelectionRequired } from '../utils/productOptions';
import * as haptics from '../utils/haptics';
import AUTH_CONFIG from '../config/auth';
import T from '../utils/typography';
import { colors } from '../utils/theme';
import { ASSET_ORIGIN } from '../utils/assets';
import { buildQuickActionRows } from '../utils/chatQuickActions';
import { openWhatsApp } from '../utils/support';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const PANEL_HEIGHT = Math.round(SCREEN_HEIGHT * 0.82);
const PANEL_HEIGHT_EXPANDED = SCREEN_HEIGHT;

/** Get user context for personalised greetings */
function getUserContext() {
  const now = new Date();
  const hour = now.getHours();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  let timeOfDay;
  if (hour >= 5 && hour < 12) timeOfDay = 'morning';
  else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
  else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
  else timeOfDay = 'night';
  const isWeekend = dayName === 'Friday' || dayName === 'Saturday';
  return { timeOfDay, dayOfWeek: dayName, isWeekend };
}

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

  return `${t(greetingKey)} ${t(contextKey)}\n\n${t('chat.welcome')}`;
}

export default function ChatButton({ visible = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
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
    if (isOpen) scrollToBottom();
  }, [messages, loading, isOpen]);

  if (!visible) return null;

  /* Quick-action definitions (3-3-2-2 layout). Deliberately not memoised: this
     sits below the `visible` early return, so a hook here would run on some
     renders and not others. */
  const [QUICK_ACTIONS_ROW1, QUICK_ACTIONS_ROW2, QUICK_ACTIONS_ROW3, QUICK_ACTIONS_ROW4] =
    buildQuickActionRows(t);

  /* ─── Chat API ─── */
  const handleSend = async (overrideText) => {
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

  const prefetchProducts = async (text) => {
    const segments = segmentChatResponse(text);
    for (const seg of segments) {
      if (seg.type === 'product' && !productCache[seg.content]) {
        try {
          const product = await fetchProductById(seg.content, user);
          if (product) setProductCache((prev) => ({ ...prev, [seg.content]: product }));
        } catch { /* skip */ }
      }
    }
  };

  const handleAddToBag = async (product) => {
    if (!product || addedProducts.has(product.id) || product.isPriceOnRequest) return;
    if (isProductOptionSelectionRequired(product)) {
      setIsOpen(false);
      router.push(`/product/${product.id}`);
      return;
    }
    haptics.mediumTap();
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
    } catch { /* silent */ }
  };

  /* ─── Handle link press ─── */
  const handleLinkPress = (url) => {
    if (!url) return;
    setIsOpen(false); // Close panel before navigating
    if (url.includes('genosys.ae')) {
      const handled = handleDeepLink(url);
      if (!handled) router.push({ pathname: '/webview', params: { url, title: '' } });
    } else {
      Linking.openURL(url).catch(() => {});
    }
  };

  /* ─── Product card ─── */
  const renderProductCard = (productId) => {
    const product = productCache[productId];
    if (!product) {
      return (
        <View style={s.productCardLoading} key={`prod-${productId}`}>
          <ActivityIndicator size="small" color={colors.accent} />
        </View>
      );
    }
    const name = getLocalizedProductName(product, locale) || product.name || '';
    const pricing = getPricingDisplay(product);
    const imageUri = product.image ? `${ASSET_ORIGIN}${product.image}` : null;
    const isAdded = addedProducts.has(product.id);

    return (
      <View style={s.productCard} key={`prod-${productId}`}>
        {imageUri ? (
          <Image source={imageUri} style={s.productImage} contentFit="contain" transition={200} cachePolicy="memory-disk" />
        ) : (
          <View style={s.productImagePlaceholder}>
            <Ionicons name="bag-outline" size={20} color={colors.separatorStrong} />
          </View>
        )}
        <View style={s.productInfo}>
          <Text style={[s.productName, isRTL && s.textRTL]} numberOfLines={2}>{name}</Text>
          {pricing.isPriceOnRequest ? (
            <Text style={s.productPriceOnRequest}>{t('product.priceOnRequest')}</Text>
          ) : (
            <Text style={s.productPrice}>{formatAed(pricing.displayPrice)}</Text>
          )}
          <View style={s.productActions}>
            {pricing.isPriceOnRequest ? (
              <TouchableOpacity
                style={s.requestQuoteBtn}
                onPress={() => {
                  haptics.mediumTap();
                  const msg = (t('product.requestQuoteMessage') || "Hi, I'm interested in {name}. Could you please provide pricing information?").replace('{name}', name);
                  openWhatsApp(msg);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-whatsapp" size={12} color={colors.white} />
                <Text style={s.addToBagText}>{t('product.requestQuote')}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[s.addToBagBtn, isAdded && s.addToBagBtnAdded]}
                onPress={() => handleAddToBag(product)}
                activeOpacity={0.8}
                disabled={isAdded}
              >
                <Ionicons name={isAdded ? 'checkmark' : 'bag-add-outline'} size={12} color={colors.white} />
                <Text style={s.addToBagText}>{isAdded ? t('chat.added') : t('chat.addToBag')}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={s.viewProductBtn}
              onPress={() => { haptics.mediumTap(); setIsOpen(false); router.push({ pathname: '/product/[id]', params: { id: product.id } }); }}
              activeOpacity={0.8}
            >
              <Text style={s.viewProductText}>{t('chat.viewProduct')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  /* ─── Linked text ─── */
  const renderLinkedText = (text, baseStyle) => {
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s)]+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
      if (match[1] && match[2]) parts.push({ type: 'link', label: match[1], url: match[2] });
      else if (match[3]) parts.push({ type: 'link', label: match[3], url: match[3] });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) parts.push({ type: 'text', content: text.slice(lastIndex) });
    if (parts.length === 0 || (parts.length === 1 && parts[0].type === 'text')) return <Text style={baseStyle}>{text}</Text>;

    return (
      <Text style={baseStyle}>
        {parts.map((part, i) =>
          part.type === 'link' ? (
            <Text key={i} style={s.linkText} onPress={() => handleLinkPress(part.url)}>{part.label}</Text>
          ) : (
            <Text key={i}>{part.content}</Text>
          )
        )}
      </Text>
    );
  };

  /* ─── Quick-action button ─── */
  const renderQuickActionButton = (item, index) => (
    <TouchableOpacity
      key={index}
      style={[s.quickActionBtn, item.highlight && s.quickActionBtnHighlight]}
      onPress={() => { haptics.lightTap(); handleSend(item.query); }}
      activeOpacity={0.8}
    >
      {item.emoji ? <Text style={s.quickActionEmoji}>{item.emoji}</Text> : null}
      <Text style={[s.quickActionLabel, item.highlight && s.quickActionLabelHighlight]}>{item.label}</Text>
    </TouchableOpacity>
  );

  /* ─── Message renderer ─── */
  const renderMessage = (msg, index) => {
    const isUser = msg.role === 'user';
    const isWelcome = !isUser && index === 0;
    const segments = isUser ? [{ type: 'text', content: msg.content }] : segmentChatResponse(msg.content);

    return (
      <View key={index}>
        <View style={[s.messageBubbleWrap, isUser ? s.userBubbleWrap : s.assistantBubbleWrap, isRTL && (isUser ? s.assistantBubbleWrap : s.userBubbleWrap)]}>
          {!isUser && (
            <View style={s.avatarCircle}>
              <Ionicons name="sparkles" size={12} color={colors.accent} />
            </View>
          )}
          <View style={[s.bubble, isUser ? s.userBubble : s.assistantBubble]}>
            {segments.map((seg, i) =>
              seg.type === 'product' ? renderProductCard(seg.content) : (
                <React.Fragment key={i}>
                  {renderLinkedText(seg.content, [s.messageText, isUser ? s.userText : s.assistantText, isRTL && s.textRTL])}
                </React.Fragment>
              )
            )}
          </View>
        </View>
        {isWelcome && messages.length === 1 && (
          <View style={s.quickActionsContainer}>
            <View style={[s.quickActionsRow, isRTL && s.quickActionsRowRTL]}>{QUICK_ACTIONS_ROW1.map(renderQuickActionButton)}</View>
            <View style={[s.quickActionsRow, isRTL && s.quickActionsRowRTL]}>{QUICK_ACTIONS_ROW2.map(renderQuickActionButton)}</View>
            <View style={[s.quickActionsRow, isRTL && s.quickActionsRowRTL]}>{QUICK_ACTIONS_ROW3.map(renderQuickActionButton)}</View>
            <View style={[s.quickActionsRow, isRTL && s.quickActionsRowRTL]}>{QUICK_ACTIONS_ROW4.map(renderQuickActionButton)}</View>
          </View>
        )}
      </View>
    );
  };

  return (
    <>
      {/* ─── Floating Button ─── */}
      {!isOpen && (
        <View style={s.fabContainer} pointerEvents="auto">
          <TouchableOpacity
            style={s.fab}
            onPress={() => { haptics.lightTap(); setIsOpen(true); }}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={t('chat.a11y.openChat')}
          >
            <Ionicons name="chatbubble-ellipses" size={26} color={colors.white} />
            <View style={s.notificationDot} />
          </TouchableOpacity>
        </View>
      )}

      {/* ─── Chat Panel Modal ─── */}
      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        {!isExpanded && (
          <TouchableWithoutFeedback onPress={() => { haptics.lightTap(); setIsOpen(false); }}>
            <View style={s.overlay} />
          </TouchableWithoutFeedback>
        )}

        <KeyboardAvoidingView
          style={s.panelContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <View style={[s.panel, { height: isExpanded ? PANEL_HEIGHT_EXPANDED : PANEL_HEIGHT, borderTopLeftRadius: isExpanded ? 0 : 20, borderTopRightRadius: isExpanded ? 0 : 20 }]}>
            {/* Header */}
            <View style={[s.panelHeader, isRTL && s.panelHeaderRTL, isExpanded && { borderTopLeftRadius: 0, borderTopRightRadius: 0, paddingTop: Platform.OS === 'ios' ? 54 : 12 }]}>
              <View style={s.headerLeft}>
                <Ionicons name="sparkles" size={16} color={colors.white} />
                <View style={{ marginStart: 6 }}>
                  <Text style={s.panelHeaderTitle}>{t('chat.title')}</Text>
                  <Text style={s.panelHeaderSubtitle}>{t('chat.subtitle')}</Text>
                </View>
              </View>
              <View style={s.headerActions}>
                <TouchableOpacity
                  onPress={() => setIsExpanded((prev) => !prev)}
                  style={s.headerActionBtn}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={isExpanded ? t('chat.a11y.collapseChat') : t('chat.a11y.expandChat')}
                >
                  <Ionicons name={isExpanded ? 'contract-outline' : 'expand-outline'} size={18} color={colors.white} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => { haptics.lightTap(); setIsOpen(false); setIsExpanded(false); }}
                  style={s.headerActionBtn}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={t('common.close')}
                >
                  <Ionicons name="close" size={20} color={colors.white} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Messages */}
            <ScrollView
              ref={scrollRef}
              style={s.messageList}
              contentContainerStyle={s.messageListContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {messages.map(renderMessage)}
              {loading && (
                <View style={[s.messageBubbleWrap, s.assistantBubbleWrap]}>
                  <View style={s.avatarCircle}>
                    <Ionicons name="sparkles" size={12} color={colors.accent} />
                  </View>
                  <View style={[s.bubble, s.assistantBubble]}>
                    <View style={s.typingRow}>
                      <ActivityIndicator size="small" color={colors.accent} />
                      <Text style={s.typingText}>{t('chat.thinking')}</Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Input */}
            <View style={[s.inputBar, isRTL && s.inputBarRTL]}>
              <TextInput
                ref={inputRef}
                style={[s.input, isRTL && s.inputRTL]}
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
                style={[s.sendBtn, (!input.trim() || loading) && s.sendBtnDisabled]}
                onPress={() => { haptics.lightTap(); handleSend(); }}
                disabled={!input.trim() || loading}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={t('chat.send')}
                accessibilityState={{ disabled: !input.trim() || loading }}
              >
                <Ionicons name="send" size={18} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  /* ─── Floating Action Button ─── */
  fabContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 72,
    right: 16,
    zIndex: 999,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.cta,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: colors.shadowCast, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8 },
      android: { elevation: 8 },
    }),
  },
  notificationDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.green,
    borderWidth: 2,
    borderColor: colors.white,
  },

  /* ─── Modal Overlay ─── */
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },

  /* ─── Panel ─── */
  panelContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  panel: {
    height: PANEL_HEIGHT,
    backgroundColor: colors.subtleBg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: colors.shadowCast, shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 12 },
      android: { elevation: 16 },
    }),
  },

  /* ─── Panel Header ─── */
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.cta,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  panelHeaderRTL: { flexDirection: 'row-reverse' },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerActionBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16 },
  panelHeaderTitle: { ...T.label, fontWeight: '700', color: colors.white },
  panelHeaderSubtitle: { ...T.badge, fontWeight: '400', color: 'rgba(255,255,255,0.8)', marginTop: 1 },

  /* ─── Messages ─── */
  messageList: { flex: 1 },
  messageListContent: { padding: 12, paddingBottom: 8 },

  messageBubbleWrap: { flexDirection: 'row', marginBottom: 10, alignItems: 'flex-end' },
  userBubbleWrap: { justifyContent: 'flex-end' },
  assistantBubbleWrap: { justifyContent: 'flex-start' },

  avatarCircle: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.redBg, alignItems: 'center', justifyContent: 'center',
    marginEnd: 6, marginBottom: 2,
  },

  bubble: { maxWidth: '80%', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 },
  userBubble: { backgroundColor: colors.cta, borderBottomEndRadius: 4 },
  assistantBubble: {
    backgroundColor: colors.card, borderBottomStartRadius: 4,
    ...Platform.select({
      ios: { shadowColor: colors.shadowCast, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
      android: { elevation: 1 },
    }),
  },

  messageText: { ...T.label, fontWeight: '400', lineHeight: 20, color: undefined },
  userText: { color: colors.white },
  assistantText: { color: colors.label },
  linkText: { ...T.link, color: colors.blue, textDecorationLine: 'underline' },
  textRTL: { textAlign: 'right' },

  typingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  typingText: { ...T.captionSmall, color: colors.mutedText, fontStyle: 'italic' },

  /* ─── Quick-action buttons ─── */
  quickActionsContainer: { marginStart: 30, marginTop: 4, marginBottom: 6, gap: 6 },
  quickActionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  quickActionsRowRTL: { flexDirection: 'row-reverse' },
  quickActionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16,
    backgroundColor: colors.fill, borderWidth: StyleSheet.hairlineWidth, borderColor: 'transparent',
  },
  quickActionBtnHighlight: { backgroundColor: colors.cta, borderColor: colors.accent },
  quickActionEmoji: { fontSize: 11 },
  quickActionLabel: { ...T.captionTiny, fontWeight: '600', color: colors.bodyText },
  quickActionLabelHighlight: { color: colors.white },

  /* ─── Product card ─── */
  productCard: {
    flexDirection: 'row', backgroundColor: colors.subtleBg, borderRadius: 10, padding: 8,
    marginVertical: 4, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.separator,
  },
  productCardLoading: { height: 50, alignItems: 'center', justifyContent: 'center', marginVertical: 4 },
  productImage: { width: 48, height: 48, borderRadius: 6, backgroundColor: colors.card },
  productImagePlaceholder: { width: 48, height: 48, borderRadius: 6, backgroundColor: colors.fill, alignItems: 'center', justifyContent: 'center' },
  productInfo: { flex: 1, marginStart: 8 },
  productName: { ...T.captionSmall, fontWeight: '600', color: colors.label, lineHeight: 16 },
  productPrice: { ...T.captionSmall, fontWeight: '800', color: colors.accent, marginTop: 2 },
  productPriceOnRequest: { ...T.captionSmall, fontWeight: '700', color: colors.whatsappDeep, marginTop: 2 },
  productActions: { flexDirection: 'row', gap: 6, marginTop: 4 },
  addToBagBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.cta, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5 },
  addToBagBtnAdded: { backgroundColor: colors.greenDeep },
  requestQuoteBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.whatsappDeep, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5 },
  addToBagText: { ...T.badge, color: colors.white },
  viewProductBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5, borderWidth: 1, borderColor: colors.separatorStrong },
  viewProductText: { ...T.badge, fontWeight: '600', color: colors.bodyText },

  /* ─── Input bar ─── */
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 12, paddingTop: 6, paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    backgroundColor: colors.card, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.separator,
  },
  inputBarRTL: { flexDirection: 'row-reverse' },
  input: {
    ...T.label, fontWeight: '400', color: colors.label,
    flex: 1, backgroundColor: colors.fill,
    borderRadius: 18, paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 8 : 6,
    maxHeight: 80, marginEnd: 8, borderWidth: 1, borderColor: colors.separator,
  },
  inputRTL: { textAlign: 'right', marginEnd: 0, marginStart: 8 },
  sendBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.cta, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: colors.separatorStrong },
});
