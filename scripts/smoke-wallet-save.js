const fs = require('fs');
const path = require('path');

const locales = ['en', 'ru', 'ar'];
const keys = [
  'addToAppleWallet',
  'addToGoogleWallet',
  'walletOpening',
  'walletError',
  'walletAddedTitle',
  'walletAdded',
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
const appleWallet = fs.readFileSync(path.join(__dirname, '..', 'services', 'appleWallet.js'), 'utf8');
const nativeModule = fs.readFileSync(
  path.join(__dirname, '..', 'modules', 'genosys-wallet', 'ios', 'GenosysWalletModule.swift'),
  'utf8',
);

if (!api.includes('fetchMembershipWalletUrl')) throw new Error('wallet API helper missing');
if (!card.includes("walletProvider = Platform.OS === 'ios' ? 'APPLE' : 'GOOGLE'")) {
  throw new Error('platform wallet selection missing');
}
if (!card.includes('WebBrowser.openBrowserAsync')) throw new Error('in-app wallet browser handoff missing');
if (!card.includes('addApplePassFromUrl')) throw new Error('native Apple Wallet handoff missing');
if (!appleWallet.includes('FileSystem.downloadAsync') || !appleWallet.includes('GenosysWallet.addPassAsync')) {
  throw new Error('signed pass download or native presentation missing');
}
if (!nativeModule.includes('PKAddPassesViewController') || !nativeModule.includes('PKPassLibrary')) {
  throw new Error('PassKit presenter missing');
}
if (!card.includes('data?.wallet?.apple') || !card.includes('data?.wallet?.google')) {
  throw new Error('provider capability gate missing');
}

console.log('[wallet-save] contract and locale checks passed');
