#!/usr/bin/env node

/**
 * App Store Screenshot Automation
 * 
 * Captures professional screenshots for App Store submission:
 * - iPhone 16 Pro Max (2868 × 1320 or 1320 × 2868)
 * - iPhone 15 Pro Max (2796 × 1290 or 1290 × 2796)
 * - iPhone 14 Pro Max (2778 × 1284 or 1284 × 2778)
 * - iPhone 13 Pro Max (2778 × 1284 or 1284 × 2778)
 * - iPhone 11 Pro Max (2688 × 1242 or 1242 × 2688)
 * 
 * App Store Requirements:
 * - Up to 10 screenshots per localization
 * - First 3 screenshots shown on app installation sheets
 * - Must be PNG or JPG
 * - Accepted sizes: 1242×2688, 2688×1242, 1284×2778, 2778×1284
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const SCREENSHOT_DIR = path.join(__dirname, '..', 'app-store-screenshots');
const DELAY_BETWEEN_SCREENS = 2000; // 2 seconds to allow UI to settle

// Screenshot plan - key screens to showcase the app
const SCREENSHOT_PLAN = [
  {
    name: '01-shop-home',
    description: 'Shop Home - Product catalog with categories',
    instructions: 'Navigate to Shop tab, show product grid with discounts',
  },
  {
    name: '02-product-detail',
    description: 'Product Detail - Product info with variants',
    instructions: 'Open a product, show product details with Add to Bag',
  },
  {
    name: '03-bag-cart',
    description: 'Shopping Bag - Cart with items',
    instructions: 'Go to Bag tab, show cart with items and totals',
  },
  {
    name: '04-checkout',
    description: 'Checkout - Payment and delivery options',
    instructions: 'Open checkout, show Apple Pay and delivery options',
  },
  {
    name: '05-profile',
    description: 'Profile - User account and orders',
    instructions: 'Go to Profile tab, show user info',
  },
  {
    name: '06-order-detail',
    description: 'Order Detail - Order history with tracking',
    instructions: 'Open an order, show order details with discount breakdown',
  },
];

// Ensure screenshot directory exists
function ensureDirectoryExists() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    console.log(`✅ Created directory: ${SCREENSHOT_DIR}`);
  }
}

// Get the currently booted iOS simulator
function getBootedSimulator() {
  try {
    const output = execSync('xcrun simctl list devices | grep "Booted"', {
      encoding: 'utf-8',
    });
    
    const match = output.match(/iPhone.*\(([A-F0-9-]+)\)/);
    if (match) {
      const deviceName = output.match(/(iPhone[^(]+)/)[1].trim();
      const udid = match[1];
      return { name: deviceName, udid };
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Get simulator screen resolution
function getSimulatorResolution(udid) {
  try {
    // Common iPhone resolutions for App Store
    const resolutions = {
      'iPhone 16 Pro Max': { width: 1320, height: 2868, scale: 3 },
      'iPhone 16 Pro': { width: 1206, height: 2622, scale: 3 },
      'iPhone 15 Pro Max': { width: 1290, height: 2796, scale: 3 },
      'iPhone 15 Pro': { width: 1179, height: 2556, scale: 3 },
      'iPhone 14 Pro Max': { width: 1284, height: 2778, scale: 3 },
      'iPhone 14 Pro': { width: 1179, height: 2556, scale: 3 },
      'iPhone 13 Pro Max': { width: 1284, height: 2778, scale: 3 },
      'iPhone 11 Pro Max': { width: 1242, height: 2688, scale: 3 },
      'iPhone XS Max': { width: 1242, height: 2688, scale: 3 },
    };
    
    // Try to match device name
    for (const [deviceName, resolution] of Object.entries(resolutions)) {
      if (udid.toLowerCase().includes(deviceName.toLowerCase().replace(/\s/g, ''))) {
        return resolution;
      }
    }
    
    // Default to iPhone 14 Pro Max (most common for App Store)
    return resolutions['iPhone 14 Pro Max'];
  } catch (error) {
    console.warn('⚠️  Could not determine resolution, using default');
    return { width: 1284, height: 2778, scale: 3 };
  }
}

// Capture screenshot from simulator
function captureScreenshot(deviceUdid, filename, description) {
  const filepath = path.join(SCREENSHOT_DIR, `${filename}.png`);
  
  try {
    console.log(`\n📸 Capturing: ${description}`);
    console.log(`   File: ${filename}.png`);
    
    // Use xcrun simctl to capture screenshot
    execSync(`xcrun simctl io ${deviceUdid} screenshot "${filepath}"`, {
      encoding: 'utf-8',
    });
    
    // Verify file exists and get size
    const stats = fs.statSync(filepath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    
    console.log(`   ✅ Saved (${sizeKB} KB)`);
    return filepath;
  } catch (error) {
    console.error(`   ❌ Failed to capture screenshot: ${error.message}`);
    return null;
  }
}

// Wait for specified milliseconds
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main execution
async function main() {
  console.log('\n🎬 App Store Screenshot Capture');
  console.log('================================\n');
  
  // Ensure directory exists
  ensureDirectoryExists();
  
  // Check for running simulator
  const simulator = getBootedSimulator();
  if (!simulator) {
    console.error('❌ No booted iOS simulator found.');
    console.error('   Please start the iOS simulator and run Expo first:');
    console.error('   npx expo start --ios');
    process.exit(1);
  }
  
  console.log(`✅ Found simulator: ${simulator.name}`);
  console.log(`   UDID: ${simulator.udid}`);
  
  const resolution = getSimulatorResolution(simulator.name);
  console.log(`   Resolution: ${resolution.width}×${resolution.height} @${resolution.scale}x`);
  
  // Display screenshot plan
  console.log(`\n📋 Screenshot Plan (${SCREENSHOT_PLAN.length} screens):`);
  SCREENSHOT_PLAN.forEach((screen, index) => {
    console.log(`   ${index + 1}. ${screen.description}`);
  });
  
  console.log('\n⏳ Starting capture in 5 seconds...');
  console.log('   Make sure the app is ready on the simulator!');
  await wait(5000);
  
  // Capture screenshots
  const capturedFiles = [];
  
  for (let i = 0; i < SCREENSHOT_PLAN.length; i++) {
    const screen = SCREENSHOT_PLAN[i];
    
    console.log(`\n[${i + 1}/${SCREENSHOT_PLAN.length}] ${screen.description}`);
    console.log(`📝 Instructions: ${screen.instructions}`);
    console.log(`⏸️  Waiting ${DELAY_BETWEEN_SCREENS / 1000}s for you to navigate...`);
    
    await wait(DELAY_BETWEEN_SCREENS);
    
    const filepath = captureScreenshot(simulator.udid, screen.name, screen.description);
    if (filepath) {
      capturedFiles.push(filepath);
    }
  }
  
  // Summary
  console.log('\n\n✅ Screenshot Capture Complete!');
  console.log('================================\n');
  console.log(`📁 Location: ${SCREENSHOT_DIR}`);
  console.log(`📊 Captured: ${capturedFiles.length}/${SCREENSHOT_PLAN.length} screenshots\n`);
  
  if (capturedFiles.length > 0) {
    console.log('📸 Screenshots:');
    capturedFiles.forEach((file, index) => {
      const filename = path.basename(file);
      console.log(`   ${index + 1}. ${filename}`);
    });
    
    console.log('\n📱 Next Steps:');
    console.log('   1. Review screenshots in: app-store-screenshots/');
    console.log('   2. Verify quality and content');
    console.log('   3. Upload to App Store Connect');
    console.log('   4. Screenshots will be used for all device sizes');
    console.log('\n💡 App Store Requirements:');
    console.log('   - Up to 10 screenshots per localization');
    console.log('   - First 3 shown on app installation sheets');
    console.log('   - Accepted: 1242×2688, 2688×1242, 1284×2778, 2778×1284');
  } else {
    console.log('❌ No screenshots were captured successfully.');
  }
  
  console.log('\n');
}

// Run
main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
