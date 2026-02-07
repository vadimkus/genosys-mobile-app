/**
 * Chat Service - Connects to the GENOSYS chatbot ("Genie") backend
 * Calls the existing /api/chat endpoint on genosys.ae
 */

import { createLogger } from '../utils/logger';

const log = createLogger('ChatService');

const CHAT_API_URL = 'https://genosys.ae/api/chat';

/**
 * Get user context for personalised greetings (time of day, weekend, etc.)
 * Mirrors the web ChatWidget getUserContext helper.
 */
function getUserContext() {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });

  let timeOfDay;
  if (hour >= 5 && hour < 12) timeOfDay = 'morning';
  else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
  else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
  else timeOfDay = 'night';

  const isWeekend = dayOfWeek === 'Friday' || dayOfWeek === 'Saturday';

  return {
    timeOfDay,
    dayOfWeek,
    isWeekend,
    localTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

/** Lazy-initialised session-level chat ID (persists for the app lifetime). */
let _chatSessionId = null;
function getChatSessionId() {
  if (!_chatSessionId) {
    _chatSessionId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
  return _chatSessionId;
}

/**
 * Send a message to the Genie chatbot and get a response.
 *
 * @param {Array<{ role: string, content: string }>} messages - Conversation history
 * @param {string} locale - Current language ('en', 'ar', 'ru')
 * @returns {Promise<string>} - Assistant's response text
 */
export async function sendChatMessage(messages, locale = 'en') {
  try {
    log.debug('Sending chat message', { messageCount: messages.length, locale });

    const response = await fetch(CHAT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/plain, application/json',
        'x-locale': locale,
      },
      body: JSON.stringify({
        messages,
        locale,
        context: getUserContext(),
        chatId: getChatSessionId(),
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return '__RATE_LIMITED__';
      }
      const errorText = await response.text().catch(() => '');
      log.error('Chat API error', { status: response.status, body: errorText });
      throw new Error(`Chat API returned ${response.status}`);
    }

    // The Vercel AI SDK streams text; we read the full response body
    const text = await response.text();
    
    // The streamed response may contain data chunks in SSE format
    // Each line starts with "0:" followed by a JSON-encoded string piece
    // Or it could be plain text if not streaming
    if (text.includes('\n0:')) {
      // SSE / streaming format from AI SDK
      const pieces = [];
      const lines = text.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('0:')) {
          try {
            // 0:"piece of text"
            const jsonStr = trimmed.slice(2);
            const parsed = JSON.parse(jsonStr);
            if (typeof parsed === 'string') {
              pieces.push(parsed);
            }
          } catch {
            // Not valid JSON, skip
          }
        }
      }
      if (pieces.length > 0) {
        return pieces.join('');
      }
    }

    // Plain text response
    return text.trim();
  } catch (error) {
    log.error('Chat service error', error?.message || error);
    throw error;
  }
}

/**
 * Parse product references from chatbot response.
 * The chatbot uses {{id:NUMBER}} format to reference products.
 *
 * @param {string} text - The chatbot response text
 * @returns {Array<{ index: number, productId: string }>} - Product references found
 */
export function parseProductReferences(text) {
  const refs = [];
  const regex = /\{\{id:(\d+)\}\}/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    refs.push({
      index: match.index,
      productId: match[1],
    });
  }
  return refs;
}

/**
 * Replace product reference placeholders with a marker for rendering.
 * Returns segments of text and product IDs.
 *
 * @param {string} text
 * @returns {Array<{ type: 'text' | 'product', content: string }>}
 */
export function segmentChatResponse(text) {
  const segments = [];
  const regex = /\{\{id:(\d+)\}\}/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Text before the product reference
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    // Product reference
    segments.push({ type: 'product', content: match[1] });
    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return segments;
}
