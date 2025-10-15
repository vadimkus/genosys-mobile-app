# API Reference


## Validation API

Comprehensive input validation utilities for forms and user input.

### Methods


#### validateEmail

```typescript
validateEmail(email: string): ValidationResult
```

Validates email addresses with comprehensive checks.

**Parameters:**
- `email` (string): Email address to validate

**Returns:** ValidationResult object with isValid, errors, and sanitizedValue

**Example:**
```typescript
const result = validateEmail('user@example.com');
if (result.isValid) {
  console.log('Valid email:', result.sanitizedValue);
} else {
  console.log('Errors:', result.errors);
}
```


#### validatePassword

```typescript
validatePassword(password: string): ValidationResult
```

Validates password strength and security requirements.

**Parameters:**
- `password` (string): Password to validate

**Returns:** ValidationResult object with validation status and errors

**Example:**
```typescript
const result = validatePassword('MySecure123');
if (result.isValid) {
  console.log('Strong password');
} else {
  console.log('Password issues:', result.errors);
}
```


#### validateForm

```typescript
validateForm(fields: Record<string, ValidationResult>): FormValidationResult
```

Validates multiple form fields and returns overall form status.

**Parameters:**
- `fields` (Record<string, ValidationResult>): Object with field validation results

**Returns:** FormValidationResult with overall form validity and field errors

**Example:**
```typescript
const fields = {
  email: validateEmail(email),
  password: validatePassword(password),
  name: validateName(name)
};

const formResult = validateForm(fields);
if (formResult.isValid) {
  // Submit form
} else {
  // Show errors
}
```


## Performance API

Performance monitoring and optimization utilities.

### Methods


#### trackScreenLoad

```typescript
trackScreenLoad(screenName: string): () => void
```

Tracks screen load time and returns cleanup function.

**Parameters:**
- `screenName` (string): Name of the screen being tracked

**Returns:** Cleanup function to stop tracking

**Example:**
```typescript
useEffect(() => {
  const endTracking = trackScreenLoad('HomeScreen');
  return endTracking;
}, []);
```


#### trackApiCall

```typescript
trackApiCall(endpoint: string, method: string): () => void
```

Tracks API call performance.

**Parameters:**
- `endpoint` (string): API endpoint URL
- `method` (string): HTTP method

**Returns:** Cleanup function to stop tracking

**Example:**
```typescript
const fetchData = async () => {
  const endTracking = trackApiCall('/api/products', 'GET');
  try {
    const response = await api.get('/api/products');
    return response.data;
  } finally {
    endTracking();
  }
};
```


## Image Cache API

Image caching and optimization service.

### Methods


#### preloadImages

```typescript
preloadImages(urls: string[]): Promise<void>
```

Preloads multiple images for better performance.

**Parameters:**
- `urls` (string[]): Array of image URLs to preload

**Returns:** Promise that resolves when all images are preloaded

**Example:**
```typescript
const imageUrls = [
  'https://example.com/image1.jpg',
  'https://example.com/image2.jpg'
];

await preloadImages(imageUrls);
console.log('Images preloaded successfully');
```


#### getOptimizedImageSource

```typescript
getOptimizedImageSource(url: string, useCase: string): ImageSource
```

Returns optimized image source for different use cases.

**Parameters:**
- `url` (string): Original image URL
- `useCase` (string): Use case: thumbnail, card, detail, fullscreen

**Returns:** Optimized ImageSource object

**Example:**
```typescript
const optimizedSource = getOptimizedImageSource(
  'https://example.com/image.jpg',
  'card'
);

<Image source={optimizedSource} />
```

