/**
 * Device info helper.
 *
 * The native HTTP client sends a CFNetwork/okhttp User-Agent that does not
 * contain "mobile"/"iphone"/"android", so server-side user-agent parsing would
 * wrongly classify app traffic as "desktop". To fix admin notifications (and any
 * other server logging), the app sends explicit x-device-* headers describing
 * the real device. The server prefers these over user-agent sniffing.
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';

const safe = (value) => {
  if (value == null) return undefined;
  const s = String(value).trim();
  return s ? s : undefined;
};

/**
 * Resolve the current device's type, OS, OS version and best-effort model.
 * @returns {{ platform: string, deviceType: 'mobile'|'tablet'|'desktop', os: string, osVersion?: string, deviceModel?: string }}
 */
export function getDeviceInfo() {
  const isIOS = Platform.OS === 'ios';
  const isAndroid = Platform.OS === 'android';

  // This app only runs on phones/tablets — never desktop.
  let deviceType = 'mobile';
  if (isIOS && Platform.isPad) deviceType = 'tablet';

  let os = 'Unknown';
  let osVersion;
  let deviceModel;

  if (isIOS) {
    os = 'iOS';
    osVersion = safe(Platform.Version);
    deviceModel = safe(Constants?.deviceName);
  } else if (isAndroid) {
    os = 'Android';
    osVersion = safe(Platform.constants?.Release) || safe(Platform.Version);
    const brand = safe(Platform.constants?.Brand) || safe(Platform.constants?.Manufacturer);
    const model = safe(Platform.constants?.Model);
    deviceModel = [brand, model].filter(Boolean).join(' ') || undefined;
  }

  return { platform: Platform.OS, deviceType, os, osVersion, deviceModel };
}

/**
 * Build the x-device-* headers describing this device.
 * Only includes headers whose values are present.
 * @returns {Record<string, string>}
 */
export function deviceInfoHeaders() {
  try {
    const info = getDeviceInfo();
    const headers = {
      'x-app-platform': info.platform,
      'x-device-type': info.deviceType,
    };
    if (info.os) headers['x-device-os'] = info.os;
    if (info.osVersion) headers['x-device-os-version'] = info.osVersion;
    if (info.deviceModel) headers['x-device-model'] = info.deviceModel;
    return headers;
  } catch {
    // Never let device-info collection break an auth request.
    return {};
  }
}

export default { getDeviceInfo, deviceInfoHeaders };
