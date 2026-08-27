// Shared helpers for app/product/[id].js (keeps the screen smaller and more declarative).

// Safely format price values that may come as strings from the API
export function formatPrice(value) {
  const num = Number(value);
  if (Number.isFinite(num)) {
    return num.toFixed(2);
  }
  return value ?? ' - ';
}

// Coerce any incoming value to a displayable string
export function asText(value) {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.filter(Boolean).join('\n');
  if (typeof value === 'object') return Object.values(value || {}).join('\n');
  return String(value);
}

export function normalizeForCompare(value) {
  return asText(value)
    .replace(/\s+/g, ' ')
    .replace(/[\u2022•·]/g, ' ')
    .trim()
    .toLowerCase();
}

export function dedupeList(arr = []) {
  const seen = new Set();
  const out = [];
  arr.forEach((raw) => {
    const val = asText(raw).trim();
    if (!val) return;
    const key = val.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(val);
    }
  });
  return out;
}

// Helper to pick the first non-empty field from possible API keys
export function pickField(product, keys) {
  if (!product) return '';
  for (const key of keys) {
    const value = product[key];
    const text = asText(value);
    if (text.trim().length > 0) return text;
  }
  return '';
}

// Try to parse JSON strings (arrays/objects); fall back to raw value
export function parseMaybeJSON(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'object') return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value.trim());
    } catch {
      return value;
    }
  }
  return value;
}

export function asStringList(value) {
  const parsed = parseMaybeJSON(value);
  if (Array.isArray(parsed)) return dedupeList(parsed.map(asText));
  const txt = asText(parsed).trim();
  if (!txt) return [];
  if (txt.includes('\n')) {
    return dedupeList(
      txt
        .split('\n')
        .map((s) => s.replace(/^\s*[-*•]\s*/, '').trim())
        .filter(Boolean)
    );
  }
  return [txt];
}

function countCharsByScript(text) {
  const s = String(text || '');
  // Basic ranges are enough for our “RU vs EN” filtering.
  const cyrillic = (s.match(/[\u0400-\u04FF]/g) || []).length;
  const latin = (s.match(/[A-Za-z]/g) || []).length;
  const arabic = (s.match(/[\u0600-\u06FF]/g) || []).length;
  return { cyrillic, latin, arabic };
}

/**
 * Remove obvious mixed-locale artifacts.
 * Example: RU locale but we still receive English-only bullet lines like "Blemish coverage, sun protection..."
 */
export function filterListForLocale(items = [], locale = 'en') {
  const loc = String(locale || '').toLowerCase();
  const list = Array.isArray(items) ? items : [];

  // Only apply for strict locales where this issue shows up.
  if (!loc.startsWith('ru') && !loc.startsWith('ar')) return list;

  const filtered = list.filter((raw) => {
    const t = asText(raw).trim();
    if (!t) return false;
    const { cyrillic, latin, arabic } = countCharsByScript(t);

    if (loc.startsWith('ru')) {
      // Drop clearly English-only lines (keep mixed lines, acronyms, numbers).
      if (cyrillic === 0 && latin >= 8) return false;
    }

    if (loc.startsWith('ar')) {
      // Drop clearly English-only lines in Arabic UI.
      if (arabic === 0 && latin >= 8) return false;
    }

    return true;
  });

  // If we accidentally filtered everything (some products only have EN bullets),
  // fall back to original list to avoid empty sections.
  return filtered.length ? filtered : list;
}

export function asKeyValueObject(value) {
  const parsed = parseMaybeJSON(value);
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
  return null;
}

export function getObjectField(product, keys) {
  if (!product) return null;
  for (const key of keys) {
    const parsed = parseMaybeJSON(product[key]);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed;
    }
  }
  return null;
}

export function toHowToSteps(value) {
  const parsed = parseMaybeJSON(value);
  if (!Array.isArray(parsed)) return [];

  const steps = parsed
    .map((x) => {
      if (!x) return null;
      if (typeof x === 'string') return { title: '', body: x };
      if (typeof x === 'object') {
        const title = asText(x.step || x.title || '').trim();
        const body = asText(x.instruction || x.description || x.body || '').trim();
        const fallback = asText(x).trim();
        return { title, body: body || (!title ? fallback : '') };
      }
      return { title: '', body: asText(x).trim() };
    })
    .filter(Boolean)
    .filter((s) => (s.title || s.body).trim().length > 0);

  const seen = new Set();
  const out = [];
  for (const s of steps) {
    const key = normalizeForCompare(s.body || s.title);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}

export function toIngredients(value) {
  const parsed = parseMaybeJSON(value);
  if (!parsed) return [];

  if (Array.isArray(parsed)) {
    const seen = new Set();
    const out = [];
    for (const item of parsed) {
      if (!item) continue;
      if (typeof item === 'string') {
        const name = item.trim();
        const key = normalizeForCompare(name);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        out.push({ name, description: '' });
        continue;
      }
      if (typeof item === 'object') {
        const name = asText(item.name || item.title || '').trim();
        const description = asText(item.description || item.details || '').trim();
        const fallback = asText(item).trim();
        const finalName = name || fallback;
        if (!finalName) continue;
        const key = normalizeForCompare(finalName);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        out.push({ name: finalName, description });
      }
    }
    return out;
  }

  return asStringList(parsed).map((name) => ({ name, description: '' }));
}

export function deriveDiscountFromBadges(product) {
  const badges = product?.badges || [];
  for (const badge of badges) {
    const text = (badge.text || '').toLowerCase();
    const match = text.match(/(\d+)\s*%/);
    if (match) {
      const pct = Number(match[1]);
      if (pct > 0 && pct < 100) {
        const base = Number(product?.displayPrice ?? product?.price ?? 0);
        if (Number.isFinite(base) && base > 0) {
          const original = base / (1 - pct / 100);
          return { percent: pct, original };
        }
        return { percent: pct, original: null };
      }
    }
  }
  return null;
}




