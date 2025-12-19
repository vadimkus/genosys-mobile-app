export const canonicalEmirateKey = (value) => {
  const s = String(value || '').trim().toLowerCase();
  if (!s) return '';
  const cleaned = s.replace(/[\.\,]/g, '').replace(/\s+/g, ' ');
  if (cleaned === 'abu dhabi' || cleaned === 'abudhabi') return 'abuDhabi';
  if (cleaned === 'dubai') return 'dubai';
  if (cleaned === 'sharjah') return 'sharjah';
  if (cleaned === 'ajman') return 'ajman';
  if (cleaned === 'umm al quwain' || cleaned === 'umm al-quwain' || cleaned === 'ummalquwain') return 'ummAlQuwain';
  if (cleaned === 'ras al khaimah' || cleaned === 'ras al-khaimah' || cleaned === 'rasalkhaimah') return 'rasAlKhaimah';
  if (cleaned === 'fujairah') return 'fujairah';
  return '';
};

export const formatEmirateLabel = (t, emirate) => {
  const raw = String(emirate || '').trim();
  const key = canonicalEmirateKey(raw);
  return key ? t(`addAddress.emirates.${key}`) : raw;
};


