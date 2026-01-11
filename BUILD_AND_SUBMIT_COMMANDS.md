# Build and Submit to App Store Connect - Commands

## Prerequisites

1. **Install EAS CLI** (if not already installed):
```bash
npm install -g eas-cli
```

2. **Login to EAS**:
```bash
eas login
```

3. **Verify your Apple credentials are configured**:
```bash
eas credentials
```

## Step 1: Build iOS Production App

Build the iOS app for App Store submission:

```bash
cd /Users/vadimkus/genosys-mobile-app
eas build --platform ios --profile production
```

**Options:**
- `--platform ios` - Build for iOS
- `--profile production` - Use production build profile (auto-increments build number)
- `--non-interactive` - Run without prompts (useful for CI/CD)

**Build will:**
- Auto-increment build number (currently at 32)
- Create a production build optimized for App Store
- Upload build artifacts to EAS servers

**Wait for build to complete** (usually 15-30 minutes)

## Step 2: Submit to App Store Connect

After the build completes, submit to App Store Connect:

```bash
eas submit --platform ios --profile production --latest
```

**Options:**
- `--platform ios` - Submit iOS build
- `--profile production` - Use production submit profile
- `--latest` - Submit the latest build
- `--non-interactive` - Run without prompts

**Alternative: Submit specific build ID**
```bash
eas submit --platform ios --profile production --id <build-id>
```

## One-Line Command (Build + Submit)

Build and automatically submit when ready:

```bash
eas build --platform ios --profile production --auto-submit
```

## Check Build Status

```bash
eas build:list --platform ios --limit 5
```

## Check Submission Status

```bash
eas submit:list --platform ios --limit 5
```

## View Build Logs

```bash
eas build:view <build-id>
```

## Manual Upload (Alternative Method)

If you have an `.ipa` file already:

```bash
eas submit --platform ios --profile production --path path/to/your-app.ipa
```

## App Store Connect Details

- **App Store Connect App ID**: 6756648064
- **Bundle Identifier**: ae.genosys.app
- **Current Build Number**: 32 (will auto-increment)
- **App Name**: Genosys UAE

## After Submission

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to your app (ID: 6756648064)
3. Check "TestFlight" tab for processing status
4. Once processed, you can:
   - Test via TestFlight
   - Submit for App Review
   - Release to App Store

## Troubleshooting

**Build fails:**
```bash
eas build:view <build-id> --logs
```

**Credentials issues:**
```bash
eas credentials
```

**Check EAS account:**
```bash
eas whoami
```

## Notes

- Builds are processed on EAS servers (no local Xcode required)
- Build number auto-increments with `autoIncrement: true` in eas.json
- Submission requires valid Apple Developer account credentials
- Processing in App Store Connect usually takes 10-30 minutes


