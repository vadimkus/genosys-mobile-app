const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const appJsonPath = path.join(root, 'app.json')
const packageJsonPath = path.join(root, 'package.json')
const packageLockPath = path.join(root, 'package-lock.json')
const expoPlistPath = path.join(root, 'ios', 'GenosysUAE', 'Supporting', 'Expo.plist')
const infoPlistPath = path.join(root, 'ios', 'GenosysUAE', 'Info.plist')
const androidBuildGradlePath = path.join(root, 'android', 'app', 'build.gradle')

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`)
}

const appConfig = readJson(appJsonPath)
const appVersion = appConfig?.expo?.version
const iosBuildNumber = appConfig?.expo?.ios?.buildNumber
const androidVersionCode = appConfig?.expo?.android?.versionCode

if (!appVersion) {
  throw new Error('app.json must define expo.version before syncing runtimeVersion')
}

// EAS Update rejects runtime version policies in bare workflow projects.
// Keep the runtime automatic by writing the current app version as a concrete string.
appConfig.expo.runtimeVersion = appVersion
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

if (fs.existsSync(infoPlistPath)) {
  let plist = fs.readFileSync(infoPlistPath, 'utf8')
  let foundShortVersion = false
  let foundBuildNumber = false

  plist = plist.replace(
    /(<key>CFBundleShortVersionString<\/key>\s*<string>)([^<]+)(<\/string>)/,
    (_match, before, _currentVersion, after) => {
      foundShortVersion = true
      return `${before}${appVersion}${after}`
    }
  )

  if (iosBuildNumber) {
    plist = plist.replace(
      /(<key>CFBundleVersion<\/key>\s*<string>)([^<]+)(<\/string>)/,
      (_match, before, _currentBuild, after) => {
        foundBuildNumber = true
        return `${before}${iosBuildNumber}${after}`
      }
    )
  } else {
    foundBuildNumber = true
  }

  if (!foundShortVersion) {
    throw new Error('Could not find CFBundleShortVersionString in Info.plist')
  }
  if (!foundBuildNumber) {
    throw new Error('Could not find CFBundleVersion in Info.plist')
  }

  fs.writeFileSync(infoPlistPath, plist)
}

if (fs.existsSync(androidBuildGradlePath)) {
  let gradle = fs.readFileSync(androidBuildGradlePath, 'utf8')
  let foundVersionName = false
  let foundVersionCode = false

  gradle = gradle.replace(/versionName\s+"[^"]+"/, () => {
    foundVersionName = true
    return `versionName "${appVersion}"`
  })

  if (androidVersionCode) {
    gradle = gradle.replace(/versionCode\s+\d+/, () => {
      foundVersionCode = true
      return `versionCode ${androidVersionCode}`
    })
  } else {
    foundVersionCode = true
  }

  if (!foundVersionName) {
    throw new Error('Could not find versionName in android/app/build.gradle')
  }
  if (!foundVersionCode) {
    throw new Error('Could not find versionCode in android/app/build.gradle')
  }

  fs.writeFileSync(androidBuildGradlePath, gradle)
}

console.log(`Synced Expo runtime/native versions to app version ${appVersion}`)
