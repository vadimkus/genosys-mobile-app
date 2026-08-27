import { Asset } from 'expo-asset';
import { File } from 'expo-file-system';
import { createLogger } from './logger';

const log = createLogger('WidgetAssets');

/**
 * Stage an image where the widget extension can read it.
 *
 * The extension is a separate process with its own bundle: it cannot `require` an app
 * asset, and it has no access to the app's container. The one place both can see is the
 * App Group directory, which `expo-widgets` exposes as `widgetsDirectory`.
 *
 * `<Image uiImage>` then takes the absolute `file://` path. That path is device-local, so
 * it is passed to the card as a prop rather than being something the server could ever
 * know — which is why the layout falls back to a text wordmark when it is absent.
 *
 * Copied once and cached, since the file outlives the process.
 */
let logoUri = null;
let attempted = false;

export async function getWidgetLogoUri() {
  if (logoUri || attempted) return logoUri;
  attempted = true;

  try {
    // Imported lazily: on a build without the widget extension this module is absent, and
    // that must be a missing logo rather than a crash.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { widgetsDirectory } = require('expo-widgets');
    if (!widgetsDirectory) return null;

    const destination = new File(widgetsDirectory, 'genosys-logo-white.png');
    if (destination.exists) {
      logoUri = destination.uri;
      return logoUri;
    }

    const asset = Asset.fromModule(require('../assets/genosys-logo-white.png'));
    await asset.downloadAsync();
    if (!asset.localUri) return null;

    new File(asset.localUri).copy(destination);
    logoUri = destination.uri;
    log.debug('Staged the widget logo at', logoUri);
    return logoUri;
  } catch (e) {
    log.debug('Could not stage the widget logo:', e?.message);
    return null;
  }
}

export default { getWidgetLogoUri };
