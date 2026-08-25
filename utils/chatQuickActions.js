/**
 * The suggestion chips offered above the chat input, in the order they appear.
 *
 * These lived twice: once in the full chat screen and once in the floating
 * chat button, written out identically. Two copies of the same list means a
 * new suggestion has to be added in both places or the two surfaces quietly
 * disagree about what the assistant can help with.
 *
 * Takes the translator so the labels follow the active language.
 */
export function buildQuickActionRows(t) {
  return [
    [
      { label: t('chat.quickDrySkin'), query: t('chat.quickDrySkinQuery'), emoji: '💧' },
      { label: t('chat.quickOilySkin'), query: t('chat.quickOilySkinQuery'), emoji: '🧴' },
      { label: t('chat.quickAntiAging'), query: t('chat.quickAntiAgingQuery'), emoji: '✨' },
    ],
    [
      { label: t('chat.quickGlassSkin'), query: t('chat.quickGlassSkinQuery'), emoji: '🪞' },
      { label: t('chat.quickAcne'), query: t('chat.quickAcneQuery'), emoji: '🌿' },
      { label: t('chat.quickRoutine'), query: t('chat.quickRoutineQuery'), emoji: '📋' },
    ],
    [
      { label: t('chat.quickWhyGenosys'), query: t('chat.quickWhyGenosysQuery'), emoji: '🏆' },
      { label: t('chat.quickSun'), query: t('chat.quickSunQuery'), emoji: '☀️' },
    ],
    [
      { label: t('chat.quickDiscount'), query: t('chat.quickDiscountQuery'), emoji: '🎁', highlight: true },
      { label: t('chat.quickAiSkin'), query: t('chat.quickAiSkinQuery'), emoji: '📸', highlight: true },
    ],
  ];
}
