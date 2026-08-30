import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { colors, shadow, surfaces } from '../../utils/theme';
import * as haptics from '../../utils/haptics';
import AUTH_CONFIG from '../../config/auth';

// API sends relative image paths (/images/...) - prepend the web origin.
function toImageUri(img) {
  const s = String(img || '').trim();
  if (!s) return null;
  if (s.startsWith('http')) return s;
  return `${AUTH_CONFIG.ASSET_ORIGIN || 'https://genosys.ae'}${s.startsWith('/') ? '' : '/'}${s}`;
}

/**
 * "Recommended Routine" card on the product page - mirrors the website PDP
 * block. Fully API-driven: the backend sends `product.routine` already
 * localized ({ heading, steps: [{ title, description, productId }] }), so
 * routine changes on the website appear here without an app update.
 *
 * Steps that reference another product deep-link to that product's page.
 */
export default function RecommendedRoutineCard({ routine, currentProductId, isRTL }) {
  const openStep = useCallback((productId) => {
    if (!productId) return;
    haptics.lightTap();
    router.push({ pathname: '/product/[id]', params: { id: String(productId) } });
  }, []);

  if (!routine || !routine.heading || !Array.isArray(routine.steps) || routine.steps.length === 0) {
    return null;
  }

  const currentId = String(currentProductId || '').trim();

  return (
    <View style={[s.card, shadow.card]}>
      <View style={[s.headerRow, isRTL && s.rowReverse]}>
        <View style={surfaces.iconWell}>
          <Ionicons name="sparkles" size={16} color={colors.accent} />
        </View>
        <Text style={[s.headerTitle, isRTL && s.textRTL]} numberOfLines={2}>
          {routine.heading}
        </Text>
      </View>

      <View style={s.steps}>
        {routine.steps.map((step, idx) => {
          const stepProductId = step?.productId ? String(step.productId).trim() : '';
          const isSelf = !!stepProductId && stepProductId === currentId;
          const linkable = !!stepProductId && !isSelf;
          const thumbUri = toImageUri(step?.image);
          const inner = (
            <View style={[s.stepRow, isRTL && s.rowReverse]}>
              <View style={s.stepNum}>
                <Text style={s.stepNumText}>{idx + 1}</Text>
              </View>
              {thumbUri ? (
                <Image
                  source={{ uri: thumbUri }}
                  style={s.thumb}
                  contentFit="cover"
                  transition={150}
                />
              ) : null}
              <View style={s.stepBody}>
                <Text style={[s.stepTitle, isRTL && s.textRTL]}>{step.title}</Text>
                <Text style={[s.stepDesc, isRTL && s.textRTL]}>{step.description}</Text>
              </View>
              {linkable ? (
                <Ionicons
                  name={isRTL ? 'chevron-back' : 'chevron-forward'}
                  size={16}
                  color={colors.tertiary}
                  style={s.chevron}
                />
              ) : null}
            </View>
          );
          return linkable ? (
            <TouchableOpacity
              key={`${idx}-${step.title}`}
              onPress={() => openStep(stepProductId)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={step.title}
            >
              {inner}
            </TouchableOpacity>
          ) : (
            <View key={`${idx}-${step.title}`}>{inner}</View>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    ...surfaces.card,
    padding: 16,
    marginBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: colors.label,
  },
  steps: {
    gap: 14,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.label,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    marginTop: 1,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
  },
  stepBody: {
    flex: 1,
    minWidth: 0,
    // The step the current product occupies renders without a trailing chevron,
    // which changes how the row measures. Without an explicit shrink the last
    // line of a long description could be clipped on that row alone.
    flexShrink: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.label,
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.secondaryLabel,
  },
  chevron: {
    marginTop: 4,
  },
});
