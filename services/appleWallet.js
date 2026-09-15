import * as FileSystem from 'expo-file-system/legacy';
import GenosysWallet from '../modules/genosys-wallet';

const MAX_PASS_BYTES = 2 * 1024 * 1024;
const TRUSTED_HOSTS = new Set(['genosys.ae', 'www.genosys.ae']);

function assertTrustedInstallUrl(installUrl) {
  const parsed = new URL(String(installUrl || ''));
  if (parsed.protocol !== 'https:' || !TRUSTED_HOSTS.has(parsed.hostname)) {
    throw new Error('wallet_install_url_untrusted');
  }
}

export async function addApplePassFromUrl(installUrl) {
  if (!GenosysWallet.isAvailable) return { status: 'unavailable' };
  assertTrustedInstallUrl(installUrl);

  const localUri = `${FileSystem.cacheDirectory}genosys-rewards-${Date.now()}.pkpass`;
  try {
    const download = await FileSystem.downloadAsync(installUrl, localUri, {
      headers: { Accept: 'application/vnd.apple.pkpass' },
    });
    if (download.status < 200 || download.status >= 300) {
      throw new Error(`wallet_pass_download_${download.status}`);
    }

    const info = await FileSystem.getInfoAsync(localUri);
    if (!info.exists || !info.size || info.size > MAX_PASS_BYTES) {
      throw new Error('wallet_pass_size_invalid');
    }

    const passBase64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return await GenosysWallet.addPassAsync(passBase64);
  } finally {
    await FileSystem.deleteAsync(localUri, { idempotent: true }).catch(() => {});
  }
}
