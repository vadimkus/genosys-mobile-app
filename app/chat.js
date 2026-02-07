/**
 * Chat Screen - AI Chatbot "Genie"
 * Full-screen chat with product card rendering and Add to Bag.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
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
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { sendChatMessage, segmentChatResponse } from '../services/chatService';
import { fetchProductById } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { getLocalizedProductName } from '../utils/productLocalization';
import AUTH_CONFIG from '../config/auth';

const ASSET_ORIGIN = AUTH_CONFIG.ASSET_ORIGIN || 'https://genosys.ae';

export default function ChatScreen() {
  const { t, locale, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const { user } = useAuth();
  const { addItem } = useCart();
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const [messages, setMessages] = useState([
    { role: 'assistant', content: t('chat.welcome') },
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

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    Keyboard.dismiss();

    const userMsg = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      // Send conversation to API (skip the welcome message for API call)
      const apiMessages = updatedMessages
        .filter((m) => m.role === 'user' || (m.role === 'assistant' && m !== messages[0]))
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await sendChatMessage(apiMessages, locale);

      if (response === '__RATE_LIMITED__') {
        setMessages((prev) => [...prev, { role: 'assistant', content: t('chat.rateLimited') }]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
        // Pre-fetch any product references
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
          if (product) {
            setProductCache((prev) => ({ ...prev, [seg.content]: product }));
          }
        } catch {
          // Product not found, skip
        }
      }
    }
  };

  const handleAddToBag = async (product) => {
    if (!product || addedProducts.has(product.id)) return;
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
      // Silent fail
    }
  };

  const renderProductCard = (productId) => {
    const product = productCache[productId];
    if (!product) {
      return (
        <View style={styles.productCardLoading} key={`prod-${productId}`}>
          <ActivityIndicator size="small" color="#dc2626" />
        </View>
      );
    }

    const name = getLocalizedProductName(product, locale) || product.name || '';
    const price = product.displayPrice ?? product.price ?? 0;
    const imageUri = product.image ? `${ASSET_ORIGIN}${product.image}` : null;
    const isAdded = addedProducts.has(product.id);

    return (
      <View style={styles.productCard} key={`prod-${productId}`}>
        {imageUri ? (
          <Image source={imageUri} style={styles.productImage} contentFit="cover" transition={200} cachePolicy="memory-disk" />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <Ionicons name="bag-outline" size={24} color="#D1D5DB" />
          </View>
        )}
        <View style={styles.productInfo}>
          <Text style={[styles.productName, isRTL && styles.textRTL]} numberOfLines={2}>
            {name}
          </Text>
          <Text style={styles.productPrice}>AED {Number(price).toFixed(2)}</Text>
          <View style={styles.productActions}>
            <TouchableOpacity
              style={[styles.addToBagBtn, isAdded && styles.addToBagBtnAdded]}
              onPress={() => handleAddToBag(product)}
              activeOpacity={0.8}
              disabled={isAdded}
            >
              <Ionicons name={isAdded ? 'checkmark' : 'bag-add-outline'} size={14} color="#fff" />
              <Text style={styles.addToBagText}>
                {isAdded ? t('chat.added') : t('chat.addToBag')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.viewProductBtn}
              onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })}
              activeOpacity={0.8}
            >
              <Text style={styles.viewProductText}>{t('chat.viewProduct')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderMessage = (msg, index) => {
    const isUser = msg.role === 'user';
    const segments = isUser ? [{ type: 'text', content: msg.content }] : segmentChatResponse(msg.content);

    return (
      <View
        key={index}
        style={[
          styles.messageBubbleWrap,
          isUser ? styles.userBubbleWrap : styles.assistantBubbleWrap,
          isRTL && (isUser ? styles.assistantBubbleWrap : styles.userBubbleWrap),
        ]}
      >
        {!isUser && (
          <View style={styles.avatarCircle}>
            <Ionicons name="sparkles" size={14} color="#dc2626" />
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          {segments.map((seg, i) =>
            seg.type === 'product' ? (
              renderProductCard(seg.content)
            ) : (
              <Text
                key={i}
                style={[
                  styles.messageText,
                  isUser ? styles.userText : styles.assistantText,
                  isRTL && styles.textRTL,
                ]}
              >
                {seg.content}
              </Text>
            )
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerTitleRow}>
            <Ionicons name="sparkles" size={18} color="#dc2626" />
            <Text style={styles.headerTitle}>{t('chat.title')}</Text>
          </View>
          <Text style={styles.headerSubtitle}>{t('chat.subtitle')}</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
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
                <Ionicons name="sparkles" size={14} color="#dc2626" />
              </View>
              <View style={[styles.bubble, styles.assistantBubble]}>
                <View style={styles.typingRow}>
                  <ActivityIndicator size="small" color="#dc2626" />
                  <Text style={styles.typingText}>{t('chat.thinking')}</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={[styles.inputBar, isRTL && styles.inputBarRTL]}>
          <TextInput
            ref={inputRef}
            style={[styles.input, isRTL && styles.inputRTL]}
            value={input}
            onChangeText={setInput}
            placeholder={t('chat.placeholder')}
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || loading}
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  headerRTL: { flexDirection: 'row-reverse' },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1F2937' },
  headerSubtitle: { fontSize: 11, color: '#6B7280', marginTop: 1 },

  messageList: { flex: 1 },
  messageListContent: { padding: 16, paddingBottom: 8 },

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
    backgroundColor: '#FEE2E2',
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
    backgroundColor: '#dc2626',
    borderBottomEndRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#ffffff',
    borderBottomStartRadius: 4,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
      android: { elevation: 1 },
    }),
  },

  messageText: { fontSize: 15, lineHeight: 22 },
  userText: { color: '#ffffff' },
  assistantText: { color: '#1F2937' },
  textRTL: { textAlign: 'right' },

  typingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typingText: { fontSize: 13, color: '#6B7280', fontStyle: 'italic' },

  // Product card
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 10,
    marginVertical: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
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
    backgroundColor: '#F3F4F6',
  },
  productImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: { flex: 1, marginStart: 10 },
  productName: { fontSize: 13, fontWeight: '600', color: '#1F2937', lineHeight: 18 },
  productPrice: { fontSize: 13, fontWeight: '800', color: '#dc2626', marginTop: 2 },
  productActions: { flexDirection: 'row', gap: 8, marginTop: 6 },
  addToBagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dc2626',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  addToBagBtnAdded: { backgroundColor: '#16A34A' },
  addToBagText: { fontSize: 11, fontWeight: '700', color: '#ffffff' },
  viewProductBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  viewProductText: { fontSize: 11, fontWeight: '600', color: '#374151' },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  inputBarRTL: { flexDirection: 'row-reverse' },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    maxHeight: 100,
    marginEnd: 8,
  },
  inputRTL: { textAlign: 'right', marginEnd: 0, marginStart: 8 },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#D1D5DB' },
});
