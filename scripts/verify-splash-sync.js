/**
 * verify-splash-sync.js
 *
 * Guards against the splash double-blink regression. The cold-start splash
 * sequence relies on a native splash and JS overlay sharing the same image and
 * white background:
 *
 *   iOS LaunchScreen.storyboard → expo splash view → JS VideoLaunchScreen cover
 *
 * If any of these layers paints the wrong color or mismatched image the user
 * sees a flash on cold launch. Native image assets need to stay synchronized
 * for binary builds, and the JS logo cover must choose the asset matching the
 * running native build before revealing the video.
 *
 *   1. assets/splash.png                                  ← source of truth in app.json
 *   2. ios/GenosysUAE/.../SplashScreenLegacy.imageset/    ← what iOS LaunchScreen draws
 *      image.png, image@2x.png, image@3x.png              ← must all be identical bytes
 * (2) is a separate copy in the iOS asset catalog that drifts whenever
 * `npx expo prebuild` runs without re-syncing, or when assets/splash.png is
 * updated without copying to the imageset.
 *
 * Historical regression: 2026-04 a stale prebuild left the imageset on
 * md5 8344b5ff... while assets/splash.png had moved to 63204fba..., causing
 * a perceptible image swap at the native→JS handoff. Fixed in commit
 * 53a1df0; this script ensures we don't drift back.
 *
 * Run via:    npm run verify:splash
 * Wired into: npm run verify:release
 *
 * Exit codes:
 *   0 — splash assets and config in sync
 *   1 — drift detected (full diff printed)
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const root = path.resolve(__dirname, '..')
const appJsonPath = path.join(root, 'app.json')
const sourcePath = path.join(root, 'assets', 'splash.png')
const imagesetDir = path.join(
  root,
  'ios',
  'GenosysUAE',
  'Images.xcassets',
  'SplashScreenLegacy.imageset',
)
const imagesetSlots = ['image.png', 'image@2x.png', 'image@3x.png']
const launchScreenStoryboard = path.join(
  root,
  'ios',
  'GenosysUAE',
  'SplashScreen.storyboard',
)
const splashBackgroundColorset = path.join(
  root,
  'ios',
  'GenosysUAE',
  'Images.xcassets',
  'SplashScreenBackground.colorset',
  'Contents.json',
)
const launchScreenComponent = path.join(
  root,
  'components',
  'VideoLaunchScreen.js',
)
const legacyBinary82SplashPath = path.join(root, 'assets', 'splash-launchscreen-binary82.png')
const legacyBinary82SplashHash = '8344b5ff5bbc0f05fe68b18e3bdc4896'

function fail(msg) {
  console.error(`\n✗ verify-splash-sync: ${msg}\n`)
  process.exit(1)
}

function md5(filePath) {
  if (!fs.existsSync(filePath)) {
    fail(`expected file not found: ${path.relative(root, filePath)}`)
  }
  const buf = fs.readFileSync(filePath)
  return crypto.createHash('md5').update(buf).digest('hex')
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

const appConfig = readJson(appJsonPath)

// 1. app.json must declare assets/splash.png as the splash image (root + iOS).
//    If someone repoints to a different file, the iOS imageset will quietly
//    drift on the next prebuild and we won't catch it without this check.
const declaredRoot = appConfig?.expo?.splash?.image
const declaredIos = appConfig?.expo?.ios?.splash?.image
const expectedDeclared = './assets/splash.png'
if (declaredRoot !== expectedDeclared) {
  fail(
    `app.json expo.splash.image is "${declaredRoot}", expected "${expectedDeclared}". ` +
      `If you intentionally moved the splash image, also re-sync the iOS imageset (see this script's header) and update this check.`,
  )
}
if (declaredIos !== expectedDeclared) {
  fail(
    `app.json expo.ios.splash.image is "${declaredIos}", expected "${expectedDeclared}".`,
  )
}

// 2. The iOS LaunchScreen storyboard must reference SplashScreenLegacy and
//    the SplashScreenBackground (white) color asset. If someone regenerates
//    the storyboard with different names this check fires loudly.
const storyboard = fs.readFileSync(launchScreenStoryboard, 'utf8')
if (!/image="SplashScreenLegacy"/.test(storyboard)) {
  fail(
    `${path.relative(root, launchScreenStoryboard)} no longer references the SplashScreenLegacy image. ` +
      `Native splash will paint a different image than the JS cover.`,
  )
}
if (!/<color key="backgroundColor" name="SplashScreenBackground"\/>/.test(storyboard)) {
  fail(
    `${path.relative(root, launchScreenStoryboard)} no longer uses the SplashScreenBackground named color. ` +
      `Native splash background may not match the JS overlay (#ffffff).`,
  )
}

// 3. SplashScreenBackground colorset must be pure white (#ffffff). The JS
//    overlay is hard-coded to white in components/VideoLaunchScreen.js — if
//    the storyboard background drifts to any other color we get the original
//    double-blink regression back.
const colorset = readJson(splashBackgroundColorset)
const components = colorset?.colors?.[0]?.color?.components
const isWhite =
  components &&
  parseFloat(components.red) === 1 &&
  parseFloat(components.green) === 1 &&
  parseFloat(components.blue) === 1 &&
  parseFloat(components.alpha) === 1
if (!isWhite) {
  fail(
    `${path.relative(root, splashBackgroundColorset)} is not pure white #ffffff. ` +
      `JS overlay (components/VideoLaunchScreen.js styles.container) is hard-coded to white. ` +
      `Either update both, or restore this colorset to white.`,
  )
}

// 4. JS overlay renders a logo cover only from native-matched assets. Build 82
//    needs the frozen legacy image because that binary shipped a stale
//    LaunchScreen raster. Build 83+ uses assets/splash.png, which is enforced
//    below to match the native imageset.
const componentSource = fs.readFileSync(launchScreenComponent, 'utf8')
if (!/require\(['"]\.\.\/assets\/splash\.png['"]\)/.test(componentSource)) {
  fail(
    `${path.relative(root, launchScreenComponent)} must require ../assets/splash.png for build 83+ JS cover parity.`,
  )
}
if (!/require\(['"]\.\.\/assets\/splash-launchscreen-binary82\.png['"]\)/.test(componentSource)) {
  fail(
    `${path.relative(root, launchScreenComponent)} must require ../assets/splash-launchscreen-binary82.png for build 82 JS cover parity.`,
  )
}
if (!/nativeBuildVersion/.test(componentSource) || !/>=\s*83/.test(componentSource)) {
  fail(
    `${path.relative(root, launchScreenComponent)} must choose current splash only for native build >= 83.`,
  )
}

const legacyHash = md5(legacyBinary82SplashPath)
if (legacyHash !== legacyBinary82SplashHash) {
  fail(
    `${path.relative(root, legacyBinary82SplashPath)} hash is ${legacyHash}, expected frozen build-82 hash ${legacyBinary82SplashHash}.`,
  )
}

// 5. The hash test that caught the original regression: assets/splash.png
//    must byte-match all three iOS imageset slots. This is the check that
//    actually fails first when the bug returns.
const sourceHash = md5(sourcePath)
const slotHashes = imagesetSlots.map((slot) => ({
  slot,
  path: path.join(imagesetDir, slot),
  hash: md5(path.join(imagesetDir, slot)),
}))

const drift = slotHashes.filter((s) => s.hash !== sourceHash)
if (drift.length > 0) {
  console.error('\n✗ verify-splash-sync: iOS LaunchScreen image drift detected')
  console.error('')
  console.error(`  ${path.relative(root, sourcePath).padEnd(60)} ${sourceHash}  ← source of truth`)
  for (const s of slotHashes) {
    const marker = s.hash === sourceHash ? '✓' : '✗'
    console.error(`${marker} ${path.relative(root, s.path).padEnd(60)} ${s.hash}`)
  }
  console.error('')
  console.error('  Fix:')
  for (const s of drift) {
    console.error(`    cp ${path.relative(root, sourcePath)} ${path.relative(root, s.path)}`)
  }
  console.error('')
  console.error(
    '  Why this matters: iOS native LaunchScreen and the JS VideoLaunchScreen cover',
  )
  console.error(
    '  must paint pixel-identical images, otherwise users see a flash on cold launch.',
  )
  console.error('')
  process.exit(1)
}

console.log(`✓ verify-splash-sync: ${imagesetSlots.length + 1} files in sync (md5 ${sourceHash})`)
