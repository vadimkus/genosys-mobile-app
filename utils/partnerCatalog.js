/**
 * Partner catalog rules for the app's Partner Portal screen.
 *
 * MIRROR of the website's lib/partnerCatalog.ts — that file is the source
 * of truth (the server enforces these rules on every order). Keep the two
 * in sync when products are reclassified.
 */

// Products that are professional in every size.
const PROFESSIONAL_PRODUCT_IDS = new Set([
  '4', '5', '6', '7', '8', '9', // Power Solutions
  '13', // SRS peeling system
  '35', // Hydro Cool Modeling Mask 1kg
  '47', // Mesopecia Kit
  '51', // Bio-Ferment powder mask 300g
  '52', // PDRN mask pack 30 sheets
  'cmk449na90077e9k5anpfqz4o', // Bio Meso PDRN Ampoule 60000
  'cmqep332d00gef4ej9y2ajz41', // Hair Stamp for HAIRGEN BOOSTER
]);

// Dual-size products: the listed sizes are the professional (big) ones.
const PROFESSIONAL_SIZES = {
  10: ['500ml'],
  15: ['500ml'],
  16: ['1000ml'],
  25: ['100g'],
  28: ['250g'],
  29: ['250g'],
  30: ['250g'],
  31: ['230g'],
  32: ['250g'],
  cmr6dajor031ygfnm6rsjkicf: ['600ml'],
};

export const isEquipmentCategory = (category) =>
  String(category || '').toLowerCase().includes('device');

// 'retail' | 'professional' | 'equipment'
export const classifyPartnerLine = (product, size) => {
  const id = String(product?.id || '');
  if (isEquipmentCategory(product?.category)) return 'equipment';
  if (PROFESSIONAL_PRODUCT_IDS.has(id)) return 'professional';
  const proSizes = PROFESSIONAL_SIZES[id];
  if (proSizes && size && proSizes.includes(size)) return 'professional';
  return 'retail';
};

export const CREDIT_DAY_OPTIONS = [30, 45, 60, 90];
export const isValidCreditDays = (days) => CREDIT_DAY_OPTIONS.includes(Number(days));

// Ordered category sections for the partner order list (same as web).
export const PARTNER_CATEGORY_GROUPS = [
  { key: 'cleansers', en: 'Cleansers', ru: 'Очищение', ar: 'منظفات' },
  { key: 'toners', en: 'Toners & Mists', ru: 'Тонеры и мисты', ar: 'تونر وبخاخ' },
  { key: 'serums', en: 'Serums', ru: 'Сыворотки', ar: 'سيرومات' },
  { key: 'creams', en: 'Creams', ru: 'Кремы', ar: 'كريمات' },
  { key: 'eye_care', en: 'Eye Care', ru: 'Уход за глазами', ar: 'العناية بالعين' },
  { key: 'masks', en: 'Masks', ru: 'Маски', ar: 'أقنعة' },
  { key: 'sun_bb', en: 'Sun & BB', ru: 'Солнцезащита и BB', ar: 'واقي شمس و BB' },
  { key: 'peeling', en: 'Peeling', ru: 'Пилинги', ar: 'تقشير' },
  { key: 'microneedling', en: 'Microneedling', ru: 'Микронидлинг', ar: 'الإبر الدقيقة' },
  { key: 'bio_meso', en: 'Bio Meso', ru: 'Био-мезо', ar: 'بيو ميزو' },
  { key: 'pro_solutions', en: 'PRO Solutions', ru: 'PRO растворы', ar: 'محاليل PRO' },
  { key: 'scalp_hair', en: 'Scalp & Hair', ru: 'Кожа головы и волосы', ar: 'فروة الرأس والشعر' },
  { key: 'beauty_boxes', en: 'Beauty Boxes', ru: 'Бьюти-боксы', ar: 'صناديق الجمال' },
  { key: 'kits', en: 'Kits', ru: 'Наборы', ar: 'أطقم' },
  { key: 'devices', en: 'Devices & Equipment', ru: 'Оборудование', ar: 'أجهزة' },
  { key: 'other', en: 'Other', ru: 'Другое', ar: 'أخرى' },
];

const GROUP_MATCH_RULES = [
  ['devices', ['device']],
  ['pro_solutions', ['pro solution']],
  ['bio_meso', ['bio meso']],
  ['beauty_boxes', ['beauty box']],
  ['kits', ['kit']],
  ['scalp_hair', ['scalp', 'hair']],
  ['sun_bb', ['cushion', 'sun']],
  ['eye_care', ['eye']],
  ['masks', ['mask']],
  ['creams', ['cream']],
  ['serums', ['serum']],
  ['toners', ['toner', 'mist']],
  ['cleansers', ['cleanser']],
  ['peeling', ['peeling']],
  ['microneedling', ['microneedling']],
];

export const partnerGroupKey = (category) => {
  const cat = String(category || '').toLowerCase();
  for (const [key, words] of GROUP_MATCH_RULES) {
    if (words.some((w) => cat.includes(w))) return key;
  }
  return 'other';
};
