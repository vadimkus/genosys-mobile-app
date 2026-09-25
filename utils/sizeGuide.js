/**
 * Size guide for the option sheet: how long each size lasts in normal use and
 * who it suits, so the customer picks with confidence instead of guessing.
 *
 * Durations are estimates for the directions on each product (face, twice a
 * day unless noted). They are phrased as "about", never promised.
 */

const COPY = {
  en: {
    lasts: 'Lasts about {d}',
    valueBadge: '{pct}% less per {unit}',
    types: {
      cream: {
        small: { d: '2 months', note: 'Your first jar. Enough to feel the difference and make it a habit.' },
        large: { d: '9 to 10 months', note: 'The jar you stop running out of. Most regulars move to this size.' },
      },
      cleanser: {
        small: { d: '3 to 4 months', note: 'A full season of morning and evening cleansing.' },
        large: { d: '10 to 12 months', note: 'A year at the sink, and a salon favourite.' },
      },
      toner: {
        small: { d: '3 months', note: 'Twice-daily toning for a full season.' },
        large: { d: '7 to 8 months', note: 'Generous enough to layer, with room to spare.' },
      },
      booster: {
        small: { d: '3 months', note: 'Home routine, twice a day.' },
        large: { d: 'a year or more', note: 'Clinic size, or for layering generously at home.' },
      },
      postcream: {
        small: { d: 'one recovery course', note: 'Sized for the 7 to 10 days after a treatment. Travels well.' },
        large: { d: '2 to 3 months', note: 'For regular treatments, or daily care of dry, reactive skin.' },
      },
    },
  },
  ru: {
    lasts: 'Хватит примерно на {d}',
    valueBadge: 'на {pct}% дешевле за {unit}',
    types: {
      cream: {
        small: { d: '2 месяца', note: 'Первая баночка: достаточно, чтобы почувствовать результат и привыкнуть.' },
        large: { d: '9-10 месяцев', note: 'Больше не заканчивается внезапно. Постоянные клиенты выбирают этот объём.' },
      },
      cleanser: {
        small: { d: '3-4 месяца', note: 'Целый сезон утреннего и вечернего очищения.' },
        large: { d: '10-12 месяцев', note: 'Год ухода и любимый формат салонов.' },
      },
      toner: {
        small: { d: '3 месяца', note: 'Тонизирование дважды в день на весь сезон.' },
        large: { d: '7-8 месяцев', note: 'Можно наносить в несколько слоёв и не экономить.' },
      },
      booster: {
        small: { d: '3 месяца', note: 'Домашний уход дважды в день.' },
        large: { d: 'год и больше', note: 'Кабинетный объём или щедрое наслаивание дома.' },
      },
      postcream: {
        small: { d: 'один курс восстановления', note: 'Рассчитан на 7-10 дней после процедуры. Удобно в поездке.' },
        large: { d: '2-3 месяца', note: 'Для регулярных процедур или ежедневного ухода за сухой, реактивной кожей.' },
      },
    },
  },
  ar: {
    lasts: 'يكفي لنحو {d}',
    valueBadge: 'أقل بنسبة {pct}% لكل {unit}',
    types: {
      cream: {
        small: { d: 'شهرين', note: 'علبتك الأولى: تكفي لتلاحظي الفرق وتجعليه عادة يومية.' },
        large: { d: '9 إلى 10 أشهر', note: 'لن ينفد منك فجأة. معظم العملاء الدائمين ينتقلون إلى هذا الحجم.' },
      },
      cleanser: {
        small: { d: '3 إلى 4 أشهر', note: 'موسم كامل من التنظيف صباحاً ومساءً.' },
        large: { d: '10 إلى 12 شهراً', note: 'سنة كاملة من الاستخدام، والحجم المفضل في الصالونات.' },
      },
      toner: {
        small: { d: '3 أشهر', note: 'تونر مرتين يومياً لموسم كامل.' },
        large: { d: '7 إلى 8 أشهر', note: 'يكفي لطبقات سخية مع فائض.' },
      },
      booster: {
        small: { d: '3 أشهر', note: 'روتين منزلي مرتين يومياً.' },
        large: { d: 'سنة أو أكثر', note: 'حجم العيادات، أو لطبقات سخية في المنزل.' },
      },
      postcream: {
        small: { d: 'دورة تعافٍ واحدة', note: 'مصمم للأيام 7 إلى 10 بعد الجلسة. مناسب للسفر.' },
        large: { d: 'شهرين إلى 3 أشهر', note: 'للجلسات المنتظمة أو العناية اليومية بالبشرة الجافة والحساسة.' },
      },
    },
  },
}

// productNumber -> product type. Only products sold in two sizes.
const TYPE_BY_PRODUCT = {
  '10': 'cleanser',
  '66': 'cleanser',
  '15': 'toner',
  '16': 'booster',
  '25': 'postcream',
  '28': 'cream',
  '29': 'cream',
  '30': 'cream',
  '31': 'cream',
  '32': 'cream',
}

const UNIT = { en: { g: 'g', ml: 'ml' }, ru: { g: 'г', ml: 'мл' }, ar: { g: 'غ', ml: 'مل' } }

const amountOf = (label) => {
  const m = String(label || '').match(/([\d.]+)\s*(ml|g)\b/i)
  return m ? { qty: Number(m[1]), unit: m[2].toLowerCase() } : null
}

/**
 * @returns {null | Record<string, { lasts: string, note: string, value?: string }>}
 *   keyed by size option value.
 */
export function getSizeGuide(product, sizes, locale = 'en') {
  const type = TYPE_BY_PRODUCT[String(product?.productNumber ?? product?.id ?? '')]
  if (!type || !Array.isArray(sizes) || sizes.length !== 2) return null
  const copy = COPY[locale] || COPY.en
  const parsed = sizes.map((s) => ({ ...s, amount: amountOf(s.label || s.value) }))
  if (parsed.some((s) => !s.amount)) return null
  const [small, large] = [...parsed].sort((a, b) => a.amount.qty - b.amount.qty)

  const guide = {}
  for (const [key, option] of [['small', small], ['large', large]]) {
    const entry = copy.types[type][key]
    guide[option.value] = { lasts: copy.lasts.replace('{d}', entry.d), note: entry.note }
  }
  const perSmall = small.price / small.amount.qty
  const perLarge = large.price / large.amount.qty
  if (small.price > 0 && large.price > 0 && perLarge < perSmall) {
    const pct = Math.round((1 - perLarge / perSmall) * 100)
    if (pct >= 10) {
      guide[large.value].value = copy.valueBadge.replace('{pct}', String(pct)).replace('{unit}', (UNIT[locale] || UNIT.en)[large.amount.unit])
    }
  }
  return guide
}

export default { getSizeGuide }
