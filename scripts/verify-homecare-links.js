const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const app = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'app.json'), 'utf8')).expo;
const websiteRoot = path.resolve(__dirname, '..', '..', 'cosmetics-website');
const aasa = JSON.parse(
  fs.readFileSync(path.join(websiteRoot, 'public', '.well-known', 'apple-app-site-association'), 'utf8')
);
const nativeIntent = fs.readFileSync(path.join(__dirname, '..', 'app', '+native-intent.js'), 'utf8');

const iosComponents = aasa.applinks.details.flatMap((detail) => detail.components || []);
const claimsRecommendationPath = (value) => value === '/r' || value.startsWith('/r/');
assert.equal(
  iosComponents.some(
    (component) => claimsRecommendationPath(String(component['/'] || '')) && component.exclude === true
  ),
  true,
  'iOS requires an explicit /r/* exclusion before any future wildcard'
);
assert.equal(
  iosComponents.some(
    (component) => claimsRecommendationPath(String(component['/'] || '')) && component.exclude !== true
  ),
  false,
  'iOS must leave /r/* in Safari for the patient web experience'
);

const androidData = (app.android.intentFilters || []).flatMap((filter) => filter.data || []);
assert.equal(
  androidData.some((entry) => claimsRecommendationPath(String(entry.pathPrefix || ''))),
  false,
  'Android must leave /r/* in the browser for the patient web experience'
);

assert.equal(
  fs.existsSync(path.join(websiteRoot, 'app', 'r', '[token]', 'page.tsx')),
  true,
  'Responsive patient recommendation route is missing'
);
assert.match(nativeIntent, /cleanPath\.startsWith\('r\/'\)/, 'Native /r guard is missing');
assert.match(nativeIntent, /WebBrowser\.openBrowserAsync\(webUrl\)/, 'Manual /r links must open in browser context');

console.log('Homecare link verification passed: /r/* stays on patient web with the native app installed.');
