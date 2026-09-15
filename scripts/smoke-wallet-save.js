const fs = require('fs');
const path = require('path');

const locales = ['en', 'ru', 'ar'];
const keys = [
  'addToAppleWallet',
  'addToGoogleWallet',
  'walletOpening',
  'walletError',
];

for (const locale of locales) {
  const messages = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'i18n', 'messages', `${locale}.json`), 'utf8'),
  );
  for (const key of keys) {
    if (!messages.rewards?.[key]) throw new Error(`${locale} missing rewards.${key}`);
  }
}

const api = fs.readFileSync(path.join(__dirname, '..', 'services', 'api.js'), 'utf8');
const card = fs.readFileSync(path.join(__dirname, '..', 'components', 'MembershipCard.js'), 'utf8');

if (!api.includes('fetchMembershipWalletUrl')) throw new Error('wallet API helper missing');
if (!card.includes("walletProvider = Platform.OS === 'ios' ? 'APPLE' : 'GOOGLE'")) {
  throw new Error('platform wallet selection missing');
}
if (!card.includes('WebBrowser.openBrowserAsync')) throw new Error('in-app wallet browser handoff missing');
if (!card.includes('data?.wallet?.apple') || !card.includes('data?.wallet?.google')) {
  throw new Error('provider capability gate missing');
}

console.log('[wallet-save] contract and locale checks passed');
