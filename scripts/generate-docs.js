#!/usr/bin/env node

/**
 * Documentation Generator
 * Generates comprehensive API and component documentation
 */

const fs = require('fs');
const path = require('path');

console.log('📚 Documentation Generator Starting...\n');

// Component documentation template
const componentDocTemplate = (componentName, props, description, examples) => `
## ${componentName}

${description}

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
${props.map(prop => `| \`${prop.name}\` | \`${prop.type}\` | \`${prop.default}\` | ${prop.description} |`).join('\n')}

### Example

\`\`\`tsx
${examples}
\`\`\`
`;

// API documentation template
const apiDocTemplate = (apiName, methods, description) => `
## ${apiName}

${description}

### Methods

${methods.map(method => `
#### ${method.name}

\`\`\`typescript
${method.signature}
\`\`\`

${method.description}

**Parameters:**
${method.parameters.map(param => `- \`${param.name}\` (${param.type}): ${param.description}`).join('\n')}

**Returns:** ${method.returns}

**Example:**
\`\`\`typescript
${method.example}
\`\`\`
`).join('\n')}
`;

// Generate component documentation
const generateComponentDocs = () => {
  console.log('🔧 Generating Component Documentation...\n');

  const components = [
    {
      name: 'ErrorBoundary',
      description: 'A React error boundary component that catches JavaScript errors anywhere in the child component tree, logs those errors, and displays a fallback UI.',
      props: [
        { name: 'children', type: 'ReactNode', default: 'undefined', description: 'Child components to render' },
        { name: 'fallback', type: 'ComponentType<{error: Error, retry: () => void}>', default: 'undefined', description: 'Custom fallback component' },
        { name: 'onError', type: '(error: Error, errorInfo: ErrorInfo) => void', default: 'undefined', description: 'Error callback function' },
      ],
      examples: `import { ErrorBoundary } from './components/ErrorBoundary';

<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>`
    },
    {
      name: 'OptimizedImage',
      description: 'An optimized image component using FastImage with caching, loading states, and error handling.',
      props: [
        { name: 'source', type: 'ImageSourcePropType', default: 'undefined', description: 'Image source' },
        { name: 'style', type: 'StyleProp<ImageStyle>', default: 'undefined', description: 'Image styles' },
        { name: 'resizeMode', type: "'contain' | 'cover' | 'stretch' | 'center'", default: "'cover'", description: 'Image resize mode' },
        { name: 'priority', type: "'low' | 'normal' | 'high'", default: "'normal'", description: 'Loading priority' },
        { name: 'cache', type: "'immutable' | 'web' | 'memory'", default: "'immutable'", description: 'Cache strategy' },
        { name: 'fallbackSource', type: 'ImageSourcePropType', default: 'undefined', description: 'Fallback image source' },
        { name: 'showLoadingIndicator', type: 'boolean', default: 'true', description: 'Show loading indicator' },
        { name: 'accessibilityLabel', type: 'string', default: 'undefined', description: 'Accessibility label' },
      ],
      examples: `import { OptimizedImage } from './components/OptimizedImage';

<OptimizedImage
  source={{ uri: 'https://example.com/image.jpg' }}
  style={{ width: 200, height: 200 }}
  resizeMode="cover"
  priority="high"
  cache="immutable"
  accessibilityLabel="Product image"
/>`
    },
    {
      name: 'OptimizedList',
      description: 'An optimized list component using FlashList for better performance with large datasets.',
      props: [
        { name: 'data', type: 'T[]', default: '[]', description: 'Array of data items' },
        { name: 'onItemPress', type: '(item: T) => void', default: 'undefined', description: 'Item press handler' },
        { name: 'onItemAddToCart', type: '(item: T) => void', default: 'undefined', description: 'Add to cart handler' },
        { name: 'numColumns', type: 'number', default: '1', description: 'Number of columns' },
        { name: 'horizontal', type: 'boolean', default: 'false', description: 'Horizontal scrolling' },
        { name: 'refreshing', type: 'boolean', default: 'false', description: 'Refresh state' },
        { name: 'onRefresh', type: '() => void', default: 'undefined', description: 'Refresh handler' },
      ],
      examples: `import { ProductGrid } from './components/OptimizedList';

<ProductGrid
  data={products}
  onItemPress={(product) => navigation.navigate('ProductDetail', { productId: product.id })}
  onItemAddToCart={(product) => addToCart(product)}
  numColumns={2}
  refreshing={refreshing}
  onRefresh={handleRefresh}
/>`
    }
  ];

  let componentDocs = '# Components\n\n';
  components.forEach(component => {
    componentDocs += componentDocTemplate(
      component.name,
      component.props,
      component.description,
      component.examples
    );
  });

  return componentDocs;
};

// Generate API documentation
const generateApiDocs = () => {
  console.log('🔧 Generating API Documentation...\n');

  const apis = [
    {
      name: 'Validation API',
      description: 'Comprehensive input validation utilities for forms and user input.',
      methods: [
        {
          name: 'validateEmail',
          signature: 'validateEmail(email: string): ValidationResult',
          description: 'Validates email addresses with comprehensive checks.',
          parameters: [
            { name: 'email', type: 'string', description: 'Email address to validate' }
          ],
          returns: 'ValidationResult object with isValid, errors, and sanitizedValue',
          example: `const result = validateEmail('user@example.com');
if (result.isValid) {
  console.log('Valid email:', result.sanitizedValue);
} else {
  console.log('Errors:', result.errors);
}`
        },
        {
          name: 'validatePassword',
          signature: 'validatePassword(password: string): ValidationResult',
          description: 'Validates password strength and security requirements.',
          parameters: [
            { name: 'password', type: 'string', description: 'Password to validate' }
          ],
          returns: 'ValidationResult object with validation status and errors',
          example: `const result = validatePassword('MySecure123');
if (result.isValid) {
  console.log('Strong password');
} else {
  console.log('Password issues:', result.errors);
}`
        },
        {
          name: 'validateForm',
          signature: 'validateForm(fields: Record<string, ValidationResult>): FormValidationResult',
          description: 'Validates multiple form fields and returns overall form status.',
          parameters: [
            { name: 'fields', type: 'Record<string, ValidationResult>', description: 'Object with field validation results' }
          ],
          returns: 'FormValidationResult with overall form validity and field errors',
          example: `const fields = {
  email: validateEmail(email),
  password: validatePassword(password),
  name: validateName(name)
};

const formResult = validateForm(fields);
if (formResult.isValid) {
  // Submit form
} else {
  // Show errors
}`
        }
      ]
    },
    {
      name: 'Performance API',
      description: 'Performance monitoring and optimization utilities.',
      methods: [
        {
          name: 'trackScreenLoad',
          signature: 'trackScreenLoad(screenName: string): () => void',
          description: 'Tracks screen load time and returns cleanup function.',
          parameters: [
            { name: 'screenName', type: 'string', description: 'Name of the screen being tracked' }
          ],
          returns: 'Cleanup function to stop tracking',
          example: `useEffect(() => {
  const endTracking = trackScreenLoad('HomeScreen');
  return endTracking;
}, []);`
        },
        {
          name: 'trackApiCall',
          signature: 'trackApiCall(endpoint: string, method: string): () => void',
          description: 'Tracks API call performance.',
          parameters: [
            { name: 'endpoint', type: 'string', description: 'API endpoint URL' },
            { name: 'method', type: 'string', description: 'HTTP method' }
          ],
          returns: 'Cleanup function to stop tracking',
          example: `const fetchData = async () => {
  const endTracking = trackApiCall('/api/products', 'GET');
  try {
    const response = await api.get('/api/products');
    return response.data;
  } finally {
    endTracking();
  }
};`
        }
      ]
    },
    {
      name: 'Image Cache API',
      description: 'Image caching and optimization service.',
      methods: [
        {
          name: 'preloadImages',
          signature: 'preloadImages(urls: string[]): Promise<void>',
          description: 'Preloads multiple images for better performance.',
          parameters: [
            { name: 'urls', type: 'string[]', description: 'Array of image URLs to preload' }
          ],
          returns: 'Promise that resolves when all images are preloaded',
          example: `const imageUrls = [
  'https://example.com/image1.jpg',
  'https://example.com/image2.jpg'
];

await preloadImages(imageUrls);
console.log('Images preloaded successfully');`
        },
        {
          name: 'getOptimizedImageSource',
          signature: 'getOptimizedImageSource(url: string, useCase: string): ImageSource',
          description: 'Returns optimized image source for different use cases.',
          parameters: [
            { name: 'url', type: 'string', description: 'Original image URL' },
            { name: 'useCase', type: 'string', description: 'Use case: thumbnail, card, detail, fullscreen' }
          ],
          returns: 'Optimized ImageSource object',
          example: `const optimizedSource = getOptimizedImageSource(
  'https://example.com/image.jpg',
  'card'
);

<Image source={optimizedSource} />`
        }
      ]
    }
  ];

  let apiDocs = '# API Reference\n\n';
  apis.forEach(api => {
    apiDocs += apiDocTemplate(api.name, api.methods, api.description);
  });

  return apiDocs;
};

// Generate main documentation
const generateMainDocs = () => {
  console.log('🔧 Generating Main Documentation...\n');

  return `# Genosys Mobile App Documentation

## Overview

The Genosys Mobile App is a React Native application built with Expo, featuring a modern architecture with TypeScript, performance optimizations, and comprehensive testing.

## Architecture

### Core Technologies
- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **TypeScript**: Type-safe JavaScript
- **React Navigation**: Navigation library
- **Zustand**: State management
- **FastImage**: Optimized image loading
- **FlashList**: High-performance lists

### Project Structure

\`\`\`
src/
├── components/          # Reusable UI components
├── screens/            # Screen components
├── navigation/         # Navigation configuration
├── services/           # API and business logic
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── config/             # Configuration files
└── test/               # Test utilities and setup
\`\`\`

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator

### Installation

\`\`\`bash
# Clone the repository
git clone <repository-url>
cd genosys-mobile-app

# Install dependencies
npm install

# Start the development server
npm start
\`\`\`

### Development Scripts

\`\`\`bash
# Start development server
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format

# Run all quality checks
npm run quality

# Analyze bundle
npm run analyze
\`\`\`

## Performance Features

### Image Optimization
- FastImage integration for 40-60% faster loading
- Intelligent caching strategies
- Lazy loading for images below the fold
- Priority-based loading

### List Performance
- FlashList for 3-5x better performance than FlatList
- Virtual scrolling for large datasets
- Memory recycling and optimization

### Bundle Optimization
- Comprehensive bundle analysis tools
- Performance monitoring and metrics
- Automated optimization recommendations

## Testing

### Test Structure
- **Unit Tests**: Individual functions and components
- **Integration Tests**: Screen interactions and user flows
- **E2E Tests**: Complete user journeys

### Running Tests
\`\`\`bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
\`\`\`

### Coverage Thresholds
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

## Code Quality

### Linting
- ESLint with TypeScript support
- React and React Native specific rules
- Accessibility rules
- Import organization

### Formatting
- Prettier for consistent code formatting
- Automatic formatting on save
- Pre-commit hooks for quality assurance

### Best Practices
- TypeScript for type safety
- Error boundaries for crash prevention
- Input validation and sanitization
- Performance monitoring
- Accessibility support

## Deployment

### Build Process
\`\`\`bash
# Build for production
expo build

# Build with analysis
npm run build:analyze
\`\`\`

### Environment Configuration
- Development, staging, and production environments
- Secure API key management
- Feature flags and configuration

## Contributing

### Development Workflow
1. Create feature branch
2. Write tests for new functionality
3. Implement feature
4. Run quality checks
5. Submit pull request

### Code Review Checklist
- [ ] Tests pass
- [ ] Code is linted and formatted
- [ ] Performance impact considered
- [ ] Accessibility requirements met
- [ ] Documentation updated

## Support

For questions and support, please contact the development team or create an issue in the repository.
`;
};

// Main execution
const main = () => {
  console.log('🎯 Genosys Mobile App - Documentation Generator\n');

  const docsDir = path.join(process.cwd(), 'docs');
  
  // Create docs directory if it doesn't exist
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // Generate documentation files
  const mainDocs = generateMainDocs();
  const componentDocs = generateComponentDocs();
  const apiDocs = generateApiDocs();

  // Write documentation files
  fs.writeFileSync(path.join(docsDir, 'README.md'), mainDocs);
  fs.writeFileSync(path.join(docsDir, 'COMPONENTS.md'), componentDocs);
  fs.writeFileSync(path.join(docsDir, 'API.md'), apiDocs);

  console.log('✅ Documentation Generated Successfully!\n');
  console.log('📁 Generated Files:');
  console.log('   📄 docs/README.md - Main documentation');
  console.log('   📄 docs/COMPONENTS.md - Component documentation');
  console.log('   📄 docs/API.md - API reference');
  console.log('\n🎉 Documentation generation complete!');
};

// Run the generator
main();
