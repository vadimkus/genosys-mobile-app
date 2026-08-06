import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
  buildProductGuideViewerUrl,
  canonicalizeProductGuideUrl,
  getProductGuideSourceUrl,
  isAllowedProductGuideNavigation,
} from '../utils/productGuide.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const withSpaces =
  'https://genosys.ae/documents/PPT/GENOSYS EyeCell EYE ZONE CARE SYSTEM.pdf';
const spacesCanonical =
  'https://genosys.ae/documents/PPT/GENOSYS%20EyeCell%20EYE%20ZONE%20CARE%20SYSTEM.pdf';
const spacesViewer = buildProductGuideViewerUrl(withSpaces);
assert.equal(canonicalizeProductGuideUrl(withSpaces), spacesCanonical);
assert.equal(
  spacesViewer,
  `https://genosys.ae/pdf-viewer?file=${encodeURIComponent(spacesCanonical)}`
);

const withEncodedAmpersand =
  'https://genosys.ae/documents/PPT/GENOSYS%20SKIN%20DEFENDER%20LIP%20%26%20EYE.pdf';
const ampViewer = buildProductGuideViewerUrl(withEncodedAmpersand);
assert.match(ampViewer, /%2526/, 'encoded %26 must survive the viewer query encoding layer');
assert.equal(
  getProductGuideSourceUrl(withEncodedAmpersand, 'ios'),
  withEncodedAmpersand,
  'iOS must load the PDF as the top-level WKWebView document so native scrolling is available'
);
assert.equal(
  getProductGuideSourceUrl(withEncodedAmpersand, 'android'),
  ampViewer,
  'Android must retain the HTML viewer because Android WebView cannot reliably render raw PDFs'
);
assert.ok(isAllowedProductGuideNavigation(ampViewer, withEncodedAmpersand));
assert.ok(isAllowedProductGuideNavigation(withEncodedAmpersand, withEncodedAmpersand));
assert.ok(
  isAllowedProductGuideNavigation(
    `https://docs.google.com/viewer?url=${encodeURIComponent(withEncodedAmpersand)}&embedded=true`,
    withEncodedAmpersand,
    { isTopFrame: false }
  )
);
assert.equal(
  isAllowedProductGuideNavigation('https://docs.google.com/viewer?url=x', withEncodedAmpersand),
  false,
  'Google viewer must never replace the top-level GENOSYS viewer'
);
assert.equal(
  isAllowedProductGuideNavigation('https://evil.example/document.pdf', withEncodedAmpersand),
  false
);
assert.equal(canonicalizeProductGuideUrl('http://genosys.ae/documents/PPT/test.pdf'), null);
assert.equal(canonicalizeProductGuideUrl('https://www.genosys.ae/documents/PPT/test.pdf'), null);

const productSource = readFileSync(path.join(root, 'app/product/[id].js'), 'utf8');
assert.match(productSource, /pathname:\s*['"]\/product-guide['"]/);
assert.match(productSource, /params:\s*\{[\s\S]*url:\s*doc\.url,[\s\S]*title:\s*localizedTitle/);
assert.doesNotMatch(
  productSource,
  /onPress=\{\(\)\s*=>\s*Linking\.openURL\(doc\.url\)/,
  'PDP PDF taps must stay inside the app'
);

const authWrapperSource = readFileSync(path.join(root, 'app/AuthWrapper.js'), 'utf8');
assert.match(authWrapperSource, /name="product-guide"/);
assert.match(authWrapperSource, /['"]\/product-guide['"]/);

const guideSource = readFileSync(path.join(root, 'app/product-guide.js'), 'utf8');
assert.match(guideSource, /getProductGuideSourceUrl\(canonicalUrl,\s*Platform\.OS\)/);
assert.match(guideSource, /source=\{\{\s*uri:\s*sourceUrl\s*\}\}/);
assert.doesNotMatch(
  guideSource,
  /source=\{\{\s*uri:\s*viewerUrl\s*\}\}/,
  'regression: an iframe-backed viewer as the iOS top-level source gets stuck on page one'
);
assert.match(
  guideSource,
  /injectedJavaScript=\{Platform\.OS === ['"]android['"] \? injectedViewerCleanup : undefined\}/
);
assert.match(guideSource, /\bscrollEnabled\b/);
assert.match(guideSource, /\bnestedScrollEnabled\b/);
assert.match(guideSource, /\bsetBuiltInZoomControls\b/);
assert.match(guideSource, /\bshowsVerticalScrollIndicator\b/);
assert.match(guideSource, /loadingOverlay[\s\S]*pointerEvents="none"/);

console.log('Product guide smoke checks passed');
