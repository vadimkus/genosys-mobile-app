#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * Analyzes the app bundle size and provides optimization recommendations
 */

const fs = require('fs');
const path = require('path');

console.log('📦 Bundle Analysis Starting...\n');

// Check if bundle visualizer is available
const checkBundleVisualizer = () => {
  try {
    require.resolve('react-native-bundle-visualizer');
    console.log('✅ react-native-bundle-visualizer is available');
    return true;
  } catch (error) {
    console.log('❌ react-native-bundle-visualizer not found');
    console.log('   Install with: npm install --save-dev react-native-bundle-visualizer');
    return false;
  }
};

// Analyze package.json dependencies
const analyzeDependencies = () => {
  console.log('🔍 Analyzing Dependencies...\n');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log('❌ package.json not found');
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  console.log('📊 Dependency Analysis:');
  console.log(`   Total dependencies: ${Object.keys(dependencies).length}`);
  
  // Large dependencies to watch out for
  const largeDependencies = [
    'react-native-fast-image',
    '@shopify/flash-list',
    'react-native-performance',
    'expo',
    'react-native',
    'react',
  ];
  
  console.log('\n🎯 Key Performance Dependencies:');
  largeDependencies.forEach(dep => {
    if (dependencies[dep]) {
      console.log(`   ✅ ${dep}: ${dependencies[dep]}`);
    }
  });
  
  // Check for potentially heavy dependencies
  const heavyDependencies = [
    'lodash',
    'moment',
    'date-fns',
    'axios',
    'react-native-vector-icons',
  ];
  
  console.log('\n⚠️  Potentially Heavy Dependencies:');
  heavyDependencies.forEach(dep => {
    if (dependencies[dep]) {
      console.log(`   ⚠️  ${dep}: ${dependencies[dep]} (consider alternatives)`);
    }
  });
};

// Generate optimization recommendations
const generateRecommendations = () => {
  console.log('\n🚀 Optimization Recommendations:\n');
  
  const recommendations = [
    {
      category: 'Image Optimization',
      items: [
        '✅ Use FastImage for better image performance',
        '✅ Implement image caching strategies',
        '✅ Use appropriate image sizes and formats',
        '✅ Lazy load images below the fold',
      ]
    },
    {
      category: 'List Performance',
      items: [
        '✅ Use FlashList for large lists',
        '✅ Implement virtual scrolling',
        '✅ Use getItemType for better performance',
        '✅ Optimize renderItem functions',
      ]
    },
    {
      category: 'Bundle Optimization',
      items: [
        '📦 Use dynamic imports for non-critical features',
        '📦 Implement code splitting',
        '📦 Remove unused dependencies',
        '📦 Use tree shaking for better dead code elimination',
      ]
    },
    {
      category: 'Memory Management',
      items: [
        '🧠 Use React.memo for expensive components',
        '🧠 Implement proper cleanup in useEffect',
        '🧠 Use useCallback and useMemo appropriately',
        '🧠 Monitor memory usage with performance tools',
      ]
    },
    {
      category: 'Network Optimization',
      items: [
        '🌐 Implement request caching',
        '🌐 Use compression for API responses',
        '🌐 Implement offline support',
        '🌐 Use CDN for static assets',
      ]
    }
  ];
  
  recommendations.forEach(({ category, items }) => {
    console.log(`📋 ${category}:`);
    items.forEach(item => console.log(`   ${item}`));
    console.log('');
  });
};

// Check for performance best practices
const checkBestPractices = () => {
  console.log('✅ Performance Best Practices Check:\n');
  
  const checks = [
    {
      name: 'Error Boundaries',
      check: () => fs.existsSync('src/components/ErrorBoundary.tsx'),
      message: 'Error boundaries implemented'
    },
    {
      name: 'Input Validation',
      check: () => fs.existsSync('src/utils/validation.ts'),
      message: 'Input validation utilities available'
    },
    {
      name: 'Performance Monitoring',
      check: () => fs.existsSync('src/utils/performance.ts'),
      message: 'Performance monitoring implemented'
    },
    {
      name: 'Optimized Images',
      check: () => fs.existsSync('src/components/OptimizedImage.tsx'),
      message: 'Optimized image components available'
    },
    {
      name: 'Optimized Lists',
      check: () => fs.existsSync('src/components/OptimizedList.tsx'),
      message: 'Optimized list components available'
    },
    {
      name: 'Environment Config',
      check: () => fs.existsSync('src/config/environment.ts'),
      message: 'Environment configuration centralized'
    }
  ];
  
  checks.forEach(({ name, check, message }) => {
    const status = check() ? '✅' : '❌';
    console.log(`   ${status} ${name}: ${message}`);
  });
};

// Main execution
const main = () => {
  console.log('🎯 Genosys Mobile App - Bundle Analysis\n');
  
  checkBundleVisualizer();
  console.log('');
  
  analyzeDependencies();
  checkBestPractices();
  generateRecommendations();
  
  console.log('📈 Next Steps:');
  console.log('   1. Run "npx react-native-bundle-visualizer" to see detailed bundle analysis');
  console.log('   2. Use "npm run analyze" to run this script regularly');
  console.log('   3. Monitor bundle size in CI/CD pipeline');
  console.log('   4. Set up bundle size budgets');
  console.log('\n🎉 Analysis complete!');
};

// Run the analysis
main();
