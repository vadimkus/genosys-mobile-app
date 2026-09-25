#!/usr/bin/env node
/**
 * OTA guard: refuses an EAS Update whose JS was built against different native
 * code than the store binary it targets.
 *
 * Why: on 16 Sep 2026 a runtime-1.12 update was published from source that had
 * moved to newer Expo/native packages. The JS called native APIs the 1.12
 * binary did not have and Google login crashed for every 1.12 user.
 *
 * How: finds the git commit EAS recorded for the newest finished production
 * store build of this platform + runtime, then compares against HEAD:
 *   - versions of every installed package that ships native code
 *   - files under modules/, ios/, android/ and the plugin list in app.json
 * Info.plist / Expo.plist / strings.xml / build.gradle edits that only touch
 * version or build numbers are ignored.
 *
 * Exit codes: 0 safe, 2 patch-only package drift (needs --accept-patch-drift),
 * 1 blocked.
 *
 *   node scripts/ota-guard.js --platform ios
 *   node scripts/ota-guard.js --platform android --accept-patch-drift
 */
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const root = path.resolve(__dirname, '..')
const args = process.argv.slice(2)
const platform = args[args.indexOf('--platform') + 1]
const acceptPatch = args.includes('--accept-patch-drift')
if (!['ios', 'android'].includes(platform)) {
  console.error('Usage: ota-guard.js --platform ios|android [--accept-patch-drift]')
  process.exit(1)
}

const sh = (cmd) => execSync(cmd, { cwd: root, maxBuffer: 1e8, stdio: ['ignore', 'pipe', 'pipe'] }).toString()
const runtime = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8')).expo.runtimeVersion

function binaryCommit() {
  const override = path.join(root, 'release', 'binaries.json')
  if (fs.existsSync(override)) {
    const pinned = JSON.parse(fs.readFileSync(override, 'utf8'))?.[platform]?.[runtime]
    if (pinned) return { commit: pinned, source: 'release/binaries.json' }
  }
  const builds = JSON.parse(sh('npx eas-cli build:list --status finished --limit 40 --json --non-interactive'))
  const match = builds.find(
    (b) => b.platform.toLowerCase() === platform && b.appVersion === runtime && String(b.buildProfile || '').startsWith('production') && b.gitCommitHash,
  )
  return match ? { commit: match.gitCommitHash, source: `EAS build ${match.appBuildVersion}` } : null
}

function nativePackages() {
  const nm = path.join(root, 'node_modules')
  const names = []
  for (const d of fs.readdirSync(nm)) {
    if (d.startsWith('.')) continue
    if (d.startsWith('@')) for (const s of fs.readdirSync(path.join(nm, d))) names.push(`${d}/${s}`)
    else names.push(d)
  }
  return names.filter((p) => {
    try {
      const dir = path.join(nm, p)
      return ['ios', 'android', 'expo-module.config.json'].some((f) => fs.existsSync(path.join(dir, f))) ||
        fs.readdirSync(dir).some((f) => f.endsWith('.podspec'))
    } catch {
      return false
    }
  })
}

const semver = (v) => String(v || '').split('.').map((n) => parseInt(n, 10))
const patchOnly = (a, b) => {
  const [x, y] = [semver(a), semver(b)]
  return a && b && x[0] === y[0] && x[1] === y[1]
}

const VERSION_ONLY = /CFBundleVersion|CFBundleShortVersionString|EXUpdatesRuntimeVersion|versionCode|versionName|expo_runtime_version|<string>[\d.]+<\/string>/
function nativeFileChanges(commit) {
  const files = sh(`git diff --name-only ${commit} HEAD -- modules ios android`).trim().split('\n').filter(Boolean)
  return files.filter((f) => {
    const changed = sh(`git diff -U0 ${commit} HEAD -- "${f}"`).split('\n').filter((l) => /^[+-](?![+-])/.test(l))
    return !changed.every((l) => VERSION_ONLY.test(l) || !l.slice(1).trim())
  })
}

function pluginChanges(commit) {
  const at = (src) => JSON.stringify(JSON.parse(src).expo.plugins)
  const before = at(sh(`git show ${commit}:app.json`))
  const after = at(fs.readFileSync(path.join(root, 'app.json'), 'utf8'))
  return before === after ? [] : ['app.json expo.plugins']
}

const found = binaryCommit()
if (!found) {
  console.error(`BLOCKED: no finished production ${platform} build for runtime ${runtime}. Build and submit the binary first.`)
  process.exit(1)
}
const { commit, source } = found
const oldLock = JSON.parse(sh(`git show ${commit}:package-lock.json`)).packages
const curLock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8')).packages
const drift = nativePackages()
  .map((p) => [p, oldLock[`node_modules/${p}`]?.version, curLock[`node_modules/${p}`]?.version])
  .filter(([, a, b]) => a !== b)
const hard = drift.filter(([, a, b]) => !patchOnly(a, b))
const soft = drift.filter(([, a, b]) => patchOnly(a, b))
const files = [...nativeFileChanges(commit), ...pluginChanges(commit)]

console.log(`OTA guard  ${platform}  runtime ${runtime}  binary ${commit.slice(0, 9)} (${source})`)
for (const [p, a, b] of hard) console.log(`  BLOCK  ${p}  ${a || '(absent)'} -> ${b || '(removed)'}`)
for (const f of files) console.log(`  BLOCK  native/config change: ${f}`)
for (const [p, a, b] of soft) console.log(`  patch  ${p}  ${a} -> ${b}`)

if (hard.length || files.length) {
  console.error('\nBLOCKED: JS would run on native code it was not built with. Ship a store build for this change, or publish from the binary commit (git worktree) instead.')
  process.exit(1)
}
if (soft.length && !acceptPatch) {
  console.error('\nPatch-level native package drift only. Re-run with --accept-patch-drift if intended.')
  process.exit(2)
}
console.log('\nOK: safe to publish.')
