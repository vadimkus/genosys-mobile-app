const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const appJsonPath = path.join(root, 'app.json')
const packageJsonPath = path.join(root, 'package.json')
const packageLockPath = path.join(root, 'package-lock.json')
const expoPlistPath = path.join(root, 'ios', 'GenosysUAE', 'Supporting', 'Expo.plist')

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`)
}

const appConfig = readJson(appJsonPath)
const appVersion = appConfig?.expo?.version

if (!appVersion) {
  throw new Error('app.json must define expo.version before syncing runtimeVersion')
}

appConfig.expo.runtimeVersion = { policy: 'appVersion' }
writeJson(appJsonPath, appConfig)

const packageJson = readJson(packageJsonPath)
packageJson.version = appVersion
writeJson(packageJsonPath, packageJson)

if (fs.existsSync(packageLockPath)) {
  const packageLock = readJson(packageLockPath)
  packageLock.version = appVersion
  if (packageLock.packages?.['']) {
    packageLock.packages[''].version = appVersion
  }
  writeJson(packageLockPath, packageLock)
}

if (fs.existsSync(expoPlistPath)) {
  const plist = fs.readFileSync(expoPlistPath, 'utf8')
  let foundRuntimeVersion = false
  const updated = plist.replace(
    /(<key>EXUpdatesRuntimeVersion<\/key>\s*<string>)([^<]+)(<\/string>)/,
    (_match, before, _currentVersion, after) => {
      foundRuntimeVersion = true
      return `${before}${appVersion}${after}`
    }
  )

  if (!foundRuntimeVersion) {
    throw new Error('Could not find EXUpdatesRuntimeVersion in Expo.plist')
  }

  fs.writeFileSync(expoPlistPath, updated)
}

console.log(`Synced Expo runtime to app version ${appVersion}`)
