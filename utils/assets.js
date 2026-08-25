import { AUTH_CONFIG } from '../config/auth';

/**
 * Where images hosted by the website are served from.
 *
 * This line was copied into seven screens and components. Identical in all of
 * them, but seven places to edit if the origin ever moves.
 */
export const ASSET_ORIGIN = AUTH_CONFIG.ASSET_ORIGIN || 'https://genosys.ae';

/**
 * The unicorn shown when a list has nothing in it: empty bag, no favourites,
 * no orders, no saved cards.
 *
 * Transparent PNG on purpose. The earlier JPEG carried a baked-in grey box
 * that sat badly on the cream pages.
 */
export const EMPTY_UNI_IMAGE = `${ASSET_ORIGIN}/_next/image?url=%2Fimages%2Favatar%2Funi-transparent.png&w=512&q=75`;
