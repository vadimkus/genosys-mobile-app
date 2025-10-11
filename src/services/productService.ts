import { getProducts, getFeaturedProducts, getNewProducts, getCategories, testConnection } from './database';
import { Product, Category } from '../types';

export class ProductService {
  private static instance: ProductService;
  private products: Product[] = [];
  private featuredProducts: Product[] = [];
  private newProducts: Product[] = [];
  private categories: Category[] = [];
  private isConnected = false;
  private eyeCellProductsAdded = false;

  static getInstance(): ProductService {
    if (!ProductService.instance) {
      ProductService.instance = new ProductService();
    }
    return ProductService.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('🔄 Initializing ProductService...');
      this.isConnected = await testConnection();
      
      if (this.isConnected) {
        await this.loadAllData();
        console.log('✅ ProductService initialized successfully');
        return true;
      } else {
        console.log('⚠️ Database not connected, using fallback data');
        await this.loadFallbackData();
        return false;
      }
    } catch (error) {
      console.error('❌ ProductService initialization failed:', error);
      await this.loadFallbackData();
      return false;
    }
  }

  private async loadAllData(): Promise<void> {
    try {
      console.log('📦 Loading products from API...');
      
      // Try to load data from API, but don't fail if some endpoints don't exist
      const [productsResult, featuredResult, newProductsResult, categoriesResult] = await Promise.allSettled([
        getProducts().catch(() => []),
        getFeaturedProducts().catch(() => []),
        getNewProducts().catch(() => []),
        getCategories().catch(() => [])
      ]);

      const products = productsResult.status === 'fulfilled' ? productsResult.value : [];
      const featured = featuredResult.status === 'fulfilled' ? featuredResult.value : [];
      const newProducts = newProductsResult.status === 'fulfilled' ? newProductsResult.value : [];
      const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value : [];

      // Debug: Log API categories
      console.log('🏷️ API categories received:', categories.map((c: any) => c.name || c));
      console.log('🏷️ API categories count:', categories.length);

      // If we got some data from API, use it
      if (products.length > 0 || featured.length > 0 || newProducts.length > 0 || categories.length > 0) {
        this.products = this.transformProducts(products);
        
        // If we have products but no featured/new, create them from the main products
        if (this.products.length > 0) {
          if (featured.length === 0) {
            // Create featured products from top-rated products
            this.featuredProducts = this.products
              .filter(p => p.averageRating >= 4.5)
              .sort((a, b) => b.averageRating - a.averageRating)
              .slice(0, 8);
          } else {
            this.featuredProducts = this.transformProducts(featured);
          }
          
          if (newProducts.length === 0) {
            // Create new products - only specific products for new arrivals
            this.newProducts = this.products
              .filter(product => 
                product.name.toLowerCase().includes('bio-ferment age defying powder mask') ||
                product.name.toLowerCase().includes('skin reboot pdrn mask pack')
              );
            console.log('⚠️ New products API not available, using specific new arrival products.');
          } else {
            this.newProducts = this.transformProducts(newProducts);
          }
          
          console.log('🏷️ Categories length check:', categories.length, 'Empty?', categories.length === 0);
          if (categories.length === 0) {
            console.log('🏷️ Using fallback categories because API categories is empty');
            // Use predefined categories (without counts initially)
            this.categories = [
              {
                id: 'all-products',
                name: 'All',
                slug: 'all-products',
                count: 0, // Will be calculated later
                isActive: true,
                sortOrder: 1,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: 'microneedling',
                name: 'Microneedling',
                slug: 'microneedling',
                count: 0, // Will be calculated later
                isActive: true,
                sortOrder: 2,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: 'pro-solution',
                name: 'PRO Solution',
                slug: 'pro-solution',
                count: 0, // Will be calculated later
                isActive: true,
                sortOrder: 3,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: 'cleanser',
                name: 'Cleanser',
                slug: 'cleanser',
                count: 0, // Will be calculated later
                isActive: true,
                sortOrder: 4,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: 'peeling',
                name: 'Peeling',
                slug: 'peeling',
                count: 0, // Will be calculated later
                isActive: true,
                sortOrder: 5,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: 'toner-mist',
                name: 'Toner/Mist',
                slug: 'toner-mist',
                count: 0, // Will be calculated later
                isActive: true,
                sortOrder: 6,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: 'serum',
                name: 'Serum',
                slug: 'serum',
                count: 0, // Will be calculated later
                isActive: true,
                sortOrder: 7,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: 'cream',
                name: 'Cream',
                slug: 'cream',
                count: 0, // Will be calculated later
                isActive: true,
                sortOrder: 8,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: 'mask',
                name: 'Mask',
                slug: 'mask',
                count: 0, // Will be calculated later
                isActive: true,
                sortOrder: 9,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: 'sun',
                name: 'Sun',
                slug: 'sun',
                count: 0, // Will be calculated later
                isActive: true,
                sortOrder: 10,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: 'cushion-bb',
                name: 'Cushion BB',
                slug: 'cushion-bb',
                count: 0, // Will be calculated later
                isActive: true,
                sortOrder: 11,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: 'scalp-hair',
                name: 'Scalp/Hair',
                slug: 'scalp-hair',
                count: 0, // Will be calculated later
                isActive: true,
                sortOrder: 12,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: 'eye-care',
                name: 'Eye Care',
                slug: 'eye-care',
                count: 0, // Will be calculated later
                isActive: true,
                sortOrder: 13,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: 'device',
                name: 'Device',
                slug: 'device',
                count: 0, // Will be calculated later
                isActive: true,
                sortOrder: 14,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            ];
            
            // Update category counts after product categorization
            this.categories.forEach(category => {
              if (category.name === 'All') {
                category.count = this.products.length;
              } else {
                category.count = this.products.filter(p => p.category === category.name).length;
              }
            });
            
            // Debug: Log category counts after recalculation
            console.log('🏷️ Category counts after recalculation:', this.categories.map(c => `${c.name} (${c.count})`));
            
            // Filter out categories with 0 products, but keep Sun and Cushion BB categories even if 0
            this.categories = this.categories.filter(cat => cat.count > 0 || cat.name === 'Sun' || cat.name === 'Cushion BB');
          } else {
            console.log('🏷️ Using API categories, transforming them');
            this.categories = this.transformCategories(categories);
            
            // Ensure Sun category is always included
            const sunCategoryExists = this.categories.some(c => c.name === 'Sun');
            if (!sunCategoryExists) {
              this.categories.push({
                id: 'sun',
                name: 'Sun',
                slug: 'sun',
                count: this.products.filter(p => p.category === 'Sun').length,
                isActive: true,
                sortOrder: 10,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              });
              console.log('☀️ Added Sun category to API categories');
            } else {
              console.log('☀️ Sun category already exists in API categories');
            }
          }
        }
        
        console.log(`✅ Loaded ${this.products.length} products, ${this.featuredProducts.length} featured, ${this.newProducts.length} new from API`);
        
        // Debug: Log categories and sun products
        console.log('🏷️ Categories loaded:', this.categories.map(c => `${c.name} (${c.count})`));
        const sunProducts = this.products.filter(p => p.category === 'Sun');
        console.log('☀️ Sun products found:', sunProducts.map(p => p.name));
        
        // Debug: Check if Sun category exists
        const sunCategory = this.categories.find(c => c.name === 'Sun');
        console.log('☀️ Sun category exists:', !!sunCategory, sunCategory ? `count: ${sunCategory.count}` : 'not found');
        
        // Debug: Check Cushion BB products
        const cushionBBProducts = this.products.filter(p => p.category === 'Cushion BB');
        console.log('💄 Cushion BB products found:', cushionBBProducts.map(p => p.name));
        console.log('💄 All product categories:', this.products.map(p => `${p.name}: ${p.category}`));
        
        // Debug: Check if Cushion BB category exists
        const cushionBBCategory = this.categories.find(c => c.name === 'Cushion BB');
        console.log('💄 Cushion BB category exists:', !!cushionBBCategory, cushionBBCategory ? `count: ${cushionBBCategory.count}` : 'not found');
        
        // Always add EyeCell products to ensure they're available
        await this.addEyeCellProducts();
      } else {
        // No data from API, use fallback
        console.log('⚠️ No data from API, using fallback data');
        await this.loadFallbackData();
        
        // Always add EyeCell products to ensure they're available
        await this.addEyeCellProducts();
        
        // Debug: Log categories and sun products for fallback
        console.log('🏷️ Fallback categories loaded:', this.categories.map(c => `${c.name} (${c.count})`));
        const sunProducts = this.products.filter(p => p.category === 'Sun');
        console.log('☀️ Fallback sun products found:', sunProducts.map(p => p.name));
        
        // Debug: Check if Sun category exists in fallback
        const sunCategory = this.categories.find(c => c.name === 'Sun');
        console.log('☀️ Fallback Sun category exists:', !!sunCategory, sunCategory ? `count: ${sunCategory.count}` : 'not found');
      }
    } catch (error) {
      console.error('❌ Error loading data from API:', error);
      await this.loadFallbackData();
      
      // Always add EyeCell products to ensure they're available
      await this.addEyeCellProducts();
    }
  }

  private async addEyeCellProducts(): Promise<void> {
    if (this.eyeCellProductsAdded) {
      console.log('👁️ EyeCell products already added, skipping...');
      return;
    }
    
    console.log('👁️ Adding EyeCell products to existing data...');
    console.log(`📊 Current products count: ${this.products.length}`);
    console.log(`📊 Current Eye Care products: ${this.products.filter(p => p.category === 'Eye Care').length}`);
    
    const eyeCellProducts = [
      {
        id: '54',
        name: 'EyeCell EYE CONTOUR CREAM',
        description: 'Daily eye cream that reduces fine lines, dark circles, and puffiness. Advanced peptide technology.',
        price: 0, // Login to see price
        originalPrice: 0,
        discountPercentage: 0,
        imageUrl: 'https://genosys.ae/_next/image?url=%2Fimages%2FEC.jpg&w=1200&q=75',
        imageUrls: ['https://genosys.ae/_next/image?url=%2Fimages%2FEC.jpg&w=1200&q=75'],
        category: 'Eye Care',
        brand: 'Genosys',
        sku: 'GEN-054',
        images: ['https://genosys.ae/_next/image?url=%2Fimages%2FEC.jpg&w=1200&q=75'],
        inStock: true,
        stockQuantity: 25,
        isFeatured: false,
        isNew: true,
        isOnSale: false,
        stock: 25,
        rating: 4.0,
        averageRating: 4.8,
        reviewCount: 0,
        sizeOptions: ['20g'],
        defaultSize: '20g',
        createdAt: '2024-03-05T10:00:00.000Z',
        updatedAt: '2024-03-05T10:00:00.000Z'
      },
      {
        id: '55',
        name: 'EyeCell EYE CONTOUR SERUM',
        description: 'Advanced eye contour serum for anti-aging and dark circle reduction. Professional eye area treatment.',
        price: 0, // Login to see price
        originalPrice: 0,
        discountPercentage: 0,
        imageUrl: 'https://genosys.ae/_next/image?url=%2Fimages%2FEYS.jpg&w=1200&q=75',
        imageUrls: ['https://genosys.ae/_next/image?url=%2Fimages%2FEYS.jpg&w=1200&q=75'],
        category: 'Eye Care',
        brand: 'Genosys',
        sku: 'GEN-055',
        images: ['https://genosys.ae/_next/image?url=%2Fimages%2FEYS.jpg&w=1200&q=75'],
        inStock: true,
        stockQuantity: 20,
        isFeatured: false,
        isNew: true,
        isOnSale: false,
        stock: 20,
        rating: 4.0,
        averageRating: 4.7,
        reviewCount: 0,
        sizeOptions: ['15ml'],
        defaultSize: '15ml',
        createdAt: '2024-03-05T10:00:00.000Z',
        updatedAt: '2024-03-05T10:00:00.000Z'
      },
      {
        id: '56',
        name: 'EyeCell EYE PEPTIDE GEL PATCH',
        description: 'Professional eye peptide gel patches for intensive eye area treatment. Advanced peptide therapy.',
        price: 0, // Login to see price
        originalPrice: 0,
        discountPercentage: 0,
        imageUrl: 'https://genosys.ae/_next/image?url=%2Fimages%2Feyecell-patch.jpg&w=1200&q=75',
        imageUrls: ['https://genosys.ae/_next/image?url=%2Fimages%2Feyecell-patch.jpg&w=1200&q=75'],
        category: 'Eye Care',
        brand: 'Genosys',
        sku: 'GEN-056',
        images: ['https://genosys.ae/_next/image?url=%2Fimages%2Feyecell-patch.jpg&w=1200&q=75'],
        inStock: true,
        stockQuantity: 15,
        isFeatured: false,
        isNew: true,
        isOnSale: false,
        stock: 15,
        rating: 4.0,
        averageRating: 4.6,
        reviewCount: 0,
        sizeOptions: ['30 patches'],
        defaultSize: '30 patches',
        createdAt: '2024-03-05T10:00:00.000Z',
        updatedAt: '2024-03-05T10:00:00.000Z'
      },
      {
        id: '57',
        name: 'EyeCell EYE ZONE CARE KIT',
        description: 'Comprehensive eye care kit with multiple components for complete eye area treatment and anti-aging.',
        price: 0, // Login to see price
        originalPrice: 0,
        discountPercentage: 0,
        imageUrl: 'https://genosys.ae/_next/image?url=%2Fimages%2Feyecell-kit.jpg&w=1200&q=75',
        imageUrls: ['https://genosys.ae/_next/image?url=%2Fimages%2Feyecell-kit.jpg&w=1200&q=75'],
        category: 'Eye Care',
        brand: 'Genosys',
        sku: 'GEN-057',
        images: ['https://genosys.ae/_next/image?url=%2Fimages%2Feyecell-kit.jpg&w=1200&q=75'],
        inStock: true,
        stockQuantity: 10,
        isFeatured: false,
        isNew: true,
        isOnSale: false,
        stock: 10,
        rating: 4.0,
        averageRating: 4.8,
        reviewCount: 0,
        sizeOptions: ['1 Kit'],
        defaultSize: '1 Kit',
        createdAt: '2024-03-05T10:00:00.000Z',
        updatedAt: '2024-03-05T10:00:00.000Z'
      },
      {
        id: '21',
        name: 'SKIN REBOOT PDRN MASK PACK',
        description: 'Professional-grade treatment mask infused with PDRN (Polydeoxyribonucleotide) extracted from salmon DNA. This advanced mask promotes cellular regeneration, accelerates skin repair, and enhances overall skin health.',
        price: 0, // Login to see price
        originalPrice: 0,
        discountPercentage: 0,
        imageUrl: 'https://genosys.ae/_next/image?url=%2Fimages%2FPDRN.png&w=1200&q=75',
        imageUrls: ['https://genosys.ae/_next/image?url=%2Fimages%2FPDRN.png&w=1200&q=75'],
        category: 'Mask',
        brand: 'Genosys',
        sku: 'GEN-021',
        images: ['https://genosys.ae/_next/image?url=%2Fimages%2FPDRN.png&w=1200&q=75'],
        inStock: true,
        stockQuantity: 20,
        isFeatured: false,
        isNew: true,
        isOnSale: false,
        stock: 20,
        rating: 4.0,
        averageRating: 4.8,
        reviewCount: 0,
        sizeOptions: ['30 sheets per container'],
        defaultSize: '30 sheets per container',
        createdAt: '2024-03-06T10:00:00.000Z',
        updatedAt: '2024-03-06T10:00:00.000Z'
      }
    ];

    // Add EyeCell products to existing products if they don't already exist
    let addedCount = 0;
    eyeCellProducts.forEach(eyeCellProduct => {
      const exists = this.products.some(p => p.id === eyeCellProduct.id);
      console.log(`🔍 Checking ${eyeCellProduct.name} (ID: ${eyeCellProduct.id}) - Exists: ${exists}`);
      if (!exists) {
        this.products.push(eyeCellProduct);
        addedCount++;
        console.log(`✅ Added ${eyeCellProduct.name}`);
      } else {
        console.log(`⚠️ Skipped ${eyeCellProduct.name} (already exists)`);
      }
    });

    // Update all category counts to reflect current products
    this.categories.forEach(category => {
      if (category.name === 'All' || category.name === 'All products') {
        category.count = this.products.length;
      } else {
        category.count = this.products.filter(p => p.category === category.name).length;
      }
    });

    this.eyeCellProductsAdded = true;
    console.log(`✅ Added ${addedCount} EyeCell products to existing data (${eyeCellProducts.length - addedCount} already existed)`);
    console.log(`📊 Final products count: ${this.products.length}`);
    console.log(`📊 Final Eye Care products: ${this.products.filter(p => p.category === 'Eye Care').length}`);
  }

  private async loadFallbackData(): Promise<void> {
    console.log('🏠 Loading fallback product data...');
    
    // Load categories exactly as specified
    this.categories = [
      {
        id: 'all-products',
        name: 'All',
        slug: 'all-products',
        count: 0,
        isActive: true,
        sortOrder: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'microneedling',
        name: 'Microneedling',
        slug: 'microneedling',
        count: 0,
        isActive: true,
        sortOrder: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'pro-solution',
        name: 'PRO Solution',
        slug: 'pro-solution',
        count: 0,
        isActive: true,
        sortOrder: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'cleanser',
        name: 'Cleanser',
        slug: 'cleanser',
        count: 0,
        isActive: true,
        sortOrder: 4,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'peeling',
        name: 'Peeling',
        slug: 'peeling',
        count: 0,
        isActive: true,
        sortOrder: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'toner-mist',
        name: 'Toner/Mist',
        slug: 'toner-mist',
        count: 0,
        isActive: true,
        sortOrder: 6,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'serum',
        name: 'Serum',
        slug: 'serum',
        count: 0,
        isActive: true,
        sortOrder: 7,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'cream',
        name: 'Cream',
        slug: 'cream',
        count: 0,
        isActive: true,
        sortOrder: 8,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'mask',
        name: 'Mask',
        slug: 'mask',
        count: 0,
        isActive: true,
        sortOrder: 9,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'sun',
        name: 'Sun',
        slug: 'sun',
        count: 0,
        isActive: true,
        sortOrder: 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'cushion-bb',
        name: 'Cushion BB',
        slug: 'cushion-bb',
        count: 0,
        isActive: true,
        sortOrder: 11,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'scalp-hair',
        name: 'Scalp/Hair',
        slug: 'scalp-hair',
        count: 0,
        isActive: true,
        sortOrder: 12,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'eye-care',
        name: 'Eye Care',
        slug: 'eye-care',
        count: 0,
        isActive: true,
        sortOrder: 13,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'device',
        name: 'Device',
        slug: 'device',
        count: 0,
        isActive: true,
        sortOrder: 14,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
        // Fallback data for when API is not available
        this.products = [
          {
            id: '1',
            name: 'Genosys Anti-Aging Cream',
            description: 'Premium anti-aging cream with advanced peptides and Korean skincare technology',
            price: 89.99,
            originalPrice: 129.99,
            discountPercentage: 31,
            imageUrl: 'https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75',
            imageUrls: ['https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75'],
            category: 'Skincare',
            brand: 'Genosys',
            sku: 'GEN-001',
            images: ['https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75'],
            inStock: true,
            stockQuantity: 50,
            isFeatured: true,
            isNew: false,
            isOnSale: true,
            stock: 50,
            rating: 4.0,
            averageRating: 4.8,
            reviewCount: 127,
            createdAt: '2024-01-15T10:00:00.000Z',
            updatedAt: '2024-01-15T10:00:00.000Z'
          },
          {
            id: '2',
            name: 'Hair Growth Serum',
            description: 'Revolutionary hair growth serum with natural ingredients and advanced technology',
            price: 149.99,
            originalPrice: 199.99,
            discountPercentage: 25,
            imageUrl: 'https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75',
            imageUrls: ['https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75'],
            category: 'Hair Care',
            brand: 'Genosys',
            sku: 'GEN-002',
            images: ['https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75'],
            inStock: true,
            stockQuantity: 30,
            isFeatured: true,
            isNew: true,
            isOnSale: true,
            stock: 30,
            rating: 4.0,
            averageRating: 4.9,
            reviewCount: 89,
            createdAt: '2024-01-20T10:00:00.000Z',
            updatedAt: '2024-01-20T10:00:00.000Z'
          },
          {
            id: '5',
            name: 'ND Cell Anti-Wrinkle Cream',
            description: 'Advanced anti-wrinkle cream with ND Cell technology',
            price: 119.99,
            originalPrice: 149.99,
            discountPercentage: 20,
            imageUrl: 'https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75',
            imageUrls: ['https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75'],
            category: 'Skincare',
            brand: 'Genosys',
            sku: 'GEN-005',
            images: ['https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75'],
            inStock: true,
            stockQuantity: 40,
            isFeatured: false,
            isNew: true,
            isOnSale: true,
            stock: 40,
            rating: 4.0,
            averageRating: 4.5,
            reviewCount: 92,
            createdAt: '2024-01-30T10:00:00.000Z',
            updatedAt: '2024-01-30T10:00:00.000Z'
          },
          {
            id: '6',
            name: 'MULTI FUNCTIONAL ANTI-WRINKLE CREAM',
            description: 'Advanced multi-functional anti-wrinkle cream with comprehensive skincare benefits',
            price: 129.99,
            originalPrice: 159.99,
            discountPercentage: 19,
            imageUrl: 'https://genosys.ae/_next/image?url=%2Fimages%2FANT.jpg&w=1200&q=75',
            imageUrls: ['https://genosys.ae/_next/image?url=%2Fimages%2FANT.jpg&w=1200&q=75'],
            category: 'Cream',
            brand: 'Genosys',
            sku: 'GEN-006',
            images: ['https://genosys.ae/_next/image?url=%2Fimages%2FANT.jpg&w=1200&q=75'],
            inStock: true,
            stockQuantity: 35,
            isFeatured: true,
            isNew: false,
            isOnSale: true,
            stock: 35,
            rating: 4.0,
            averageRating: 4.7,
            reviewCount: 143,
            sizeOptions: ['30ml', '50ml'],
            defaultSize: '30ml',
            createdAt: '2024-02-01T10:00:00.000Z',
            updatedAt: '2024-02-01T10:00:00.000Z'
          },
          {
            id: '7',
            name: 'MULTI FUNCTIONAL ANTI-WRINKLE SERUM',
            description: 'Powerful multi-functional anti-wrinkle serum for advanced skincare treatment',
            price: 149.99,
            originalPrice: 179.99,
            discountPercentage: 17,
            imageUrl: 'https://genosys.ae/_next/image?url=%2Fimages%2FMSSS.jpg&w=1200&q=75',
            imageUrls: ['https://genosys.ae/_next/image?url=%2Fimages%2FMSSS.jpg&w=1200&q=75'],
            category: 'Serum',
            brand: 'Genosys',
            sku: 'GEN-007',
            images: ['https://genosys.ae/_next/image?url=%2Fimages%2FMSSS.jpg&w=1200&q=75'],
            inStock: true,
            stockQuantity: 28,
            isFeatured: true,
            isNew: true,
            isOnSale: true,
            stock: 28,
            rating: 4.0,
            averageRating: 4.8,
            reviewCount: 167,
            sizeOptions: ['15ml', '30ml'],
            defaultSize: '30ml',
            createdAt: '2024-02-05T10:00:00.000Z',
            updatedAt: '2024-02-05T10:00:00.000Z'
          },
          {
            id: '8',
            name: 'MULTI SUN CREAM [SPF 40 PA++]',
            description: 'Comprehensive sun protection cream with SPF 40 and PA++ rating for complete UV protection',
            price: 89.99,
            originalPrice: 119.99,
            discountPercentage: 25,
            imageUrl: 'https://genosys.ae/_next/image?url=%2Fimages%2FSSUN.jpg&w=1200&q=75',
            imageUrls: ['https://genosys.ae/_next/image?url=%2Fimages%2FSSUN.jpg&w=1200&q=75'],
            category: 'Sun',
            brand: 'Genosys',
            sku: 'GEN-008',
            images: ['https://genosys.ae/_next/image?url=%2Fimages%2FSSUN.jpg&w=1200&q=75'],
            inStock: true,
            stockQuantity: 45,
            isFeatured: false,
            isNew: true,
            isOnSale: true,
            stock: 45,
            rating: 4.0,
            averageRating: 4.6,
            reviewCount: 98,
            sizeOptions: ['50ml', '100ml'],
            defaultSize: '50ml',
            createdAt: '2024-02-10T10:00:00.000Z',
            updatedAt: '2024-02-10T10:00:00.000Z'
          },
          {
            id: '9',
            name: 'MULTI VITA RADIANCE CREAM',
            description: 'Multi-vitamin radiance cream for bright, glowing skin with essential vitamins',
            price: 109.99,
            originalPrice: 139.99,
            discountPercentage: 21,
            imageUrl: 'https://genosys.ae/_next/image?url=%2Fimages%2FRAA.jpg&w=1200&q=75',
            imageUrls: ['https://genosys.ae/_next/image?url=%2Fimages%2FRAA.jpg&w=1200&q=75'],
            category: 'Cream',
            brand: 'Genosys',
            sku: 'GEN-009',
            images: ['https://genosys.ae/_next/image?url=%2Fimages%2FRAA.jpg&w=1200&q=75'],
            inStock: true,
            stockQuantity: 32,
            isFeatured: false,
            isNew: true,
            isOnSale: true,
            stock: 32,
            rating: 4.0,
            averageRating: 4.4,
            reviewCount: 76,
            sizeOptions: ['30ml', '60ml'],
            defaultSize: '30ml',
            createdAt: '2024-02-15T10:00:00.000Z',
            updatedAt: '2024-02-15T10:00:00.000Z'
          },
          {
            id: '10',
            name: 'Microneedle Roller',
            description: 'Professional microneedling device for advanced skin rejuvenation and collagen stimulation',
            price: 199.99,
            originalPrice: 249.99,
            discountPercentage: 20,
            imageUrl: 'https://genosys.ae/_next/image?url=%2Fimages%2Fgenosys-microneedling-devices.jpg&w=1200&q=75',
            imageUrls: ['https://genosys.ae/_next/image?url=%2Fimages%2Fgenosys-microneedling-devices.jpg&w=1200&q=75'],
            category: 'Microneedling',
            brand: 'Genosys',
            sku: 'GEN-010',
            images: ['https://genosys.ae/_next/image?url=%2Fimages%2Fgenosys-microneedling-devices.jpg&w=1200&q=75'],
            inStock: true,
            stockQuantity: 15,
            isFeatured: true,
            isNew: false,
            isOnSale: true,
            stock: 15,
            rating: 4.0,
            averageRating: 4.9,
            reviewCount: 89,
            sizeOptions: ['0.25mm', '0.5mm', '0.1mm', '0.15mm', '0.2mm'],
            defaultSize: '0.25mm',
            createdAt: '2024-02-20T10:00:00.000Z',
            updatedAt: '2024-02-20T10:00:00.000Z'
          },
          {
            id: '11',
            name: 'INTENSIVE HYDRO SOOTHING CREAM',
            description: 'Intensive hydro soothing cream with aloe vera and snail secretion filtrate for deep hydration and skin comfort',
            price: 79.99,
            originalPrice: 99.99,
            discountPercentage: 20,
            imageUrl: 'https://genosys.ae/_next/image?url=%2Fimages%2FHSC.jpg&w=1200&q=75',
            imageUrls: ['https://genosys.ae/_next/image?url=%2Fimages%2FHSC.jpg&w=1200&q=75'],
            category: 'Cream',
            brand: 'Genosys',
            sku: 'GEN-011',
            images: ['https://genosys.ae/_next/image?url=%2Fimages%2FHSC.jpg&w=1200&q=75'],
            inStock: true,
            stockQuantity: 40,
            isFeatured: false,
            isNew: true,
            isOnSale: true,
            stock: 40,
            rating: 4.0,
            averageRating: 4.8,
            reviewCount: 156,
            sizeOptions: ['50g', '250g'],
            defaultSize: '50g',
            createdAt: '2024-02-25T10:00:00.000Z',
            updatedAt: '2024-02-25T10:00:00.000Z'
          },
          {
            id: '12',
            name: 'ND Cell ANTI-WRINKLE CREAM',
            description: 'Advanced anti-wrinkle cream with ND Cell technology for deep skin rejuvenation and wrinkle reduction',
            price: 89.99,
            originalPrice: 119.99,
            discountPercentage: 25,
            imageUrl: 'https://genosys.ae/_next/image?url=%2Fimages%2FND.jpg&w=1200&q=75',
            imageUrls: ['https://genosys.ae/_next/image?url=%2Fimages%2FND.jpg&w=1200&q=75'],
            category: 'Cream',
            brand: 'Genosys',
            sku: 'GEN-012',
            images: ['https://genosys.ae/_next/image?url=%2Fimages%2FND.jpg&w=1200&q=75'],
            inStock: true,
            stockQuantity: 25,
            isFeatured: false,
            isNew: true,
            isOnSale: true,
            stock: 25,
            rating: 4.0,
            averageRating: 4.7,
            reviewCount: 89,
            sizeOptions: ['30ml', '50ml'],
            defaultSize: '30ml',
            createdAt: '2024-02-26T10:00:00.000Z',
            updatedAt: '2024-02-26T10:00:00.000Z'
          },
          {
            id: '13',
            name: 'Needle Pen-K',
            description: 'Professional needle pen device for advanced skin treatment and precision application',
            price: 149.99,
            originalPrice: 199.99,
            discountPercentage: 25,
            imageUrl: 'https://genosys.ae/_next/image?url=%2Fimages%2FNeedlePenK.jpg&w=1200&q=75',
            imageUrls: ['https://genosys.ae/_next/image?url=%2Fimages%2FNeedlePenK.jpg&w=1200&q=75'],
            category: 'Device',
            brand: 'Genosys',
            sku: 'GEN-013',
            images: ['https://genosys.ae/_next/image?url=%2Fimages%2FNeedlePenK.jpg&w=1200&q=75'],
            inStock: true,
            stockQuantity: 15,
            isFeatured: false,
            isNew: true,
            isOnSale: true,
            stock: 15,
            rating: 4.0,
            averageRating: 4.6,
            reviewCount: 67,
            sizeOptions: ['0.25mm', '0.5mm', '1.0mm'],
            defaultSize: '0.25mm',
            createdAt: '2024-02-27T10:00:00.000Z',
            updatedAt: '2024-02-27T10:00:00.000Z'
          },
          {
            id: '14',
            name: 'PEPTIDE GEL MASK',
            description: 'Advanced peptide gel mask for intensive skin rejuvenation and anti-aging treatment',
            price: 69.99,
            originalPrice: 89.99,
            discountPercentage: 22,
            imageUrl: 'https://genosys.ae/_next/image?url=%2Fimages%2FPEP.jpg&w=1200&q=75',
            imageUrls: ['https://genosys.ae/_next/image?url=%2Fimages%2FPEP.jpg&w=1200&q=75'],
            category: 'Mask',
            brand: 'Genosys',
            sku: 'GEN-014',
            images: ['https://genosys.ae/_next/image?url=%2Fimages%2FPEP.jpg&w=1200&q=75'],
            inStock: true,
            stockQuantity: 30,
            isFeatured: false,
            isNew: true,
            isOnSale: true,
            stock: 30,
            rating: 4.0,
            averageRating: 4.5,
            reviewCount: 124,
            sizeOptions: ['50ml', '100ml'],
            defaultSize: '50ml',
            createdAt: '2024-02-27T10:00:00.000Z',
            updatedAt: '2024-02-27T10:00:00.000Z'
          },
          {
            id: '15',
            name: 'POWER SOLUTION AWS',
            description: 'Powerful solution for advanced skin treatment with AWS technology for optimal results',
            price: 99.99,
            originalPrice: 129.99,
            discountPercentage: 23,
            imageUrl: 'https://genosys.ae/_next/image?url=%2Fimages%2FAWS.jpg&w=1200&q=75',
            imageUrls: ['https://genosys.ae/_next/image?url=%2Fimages%2FAWS.jpg&w=1200&q=75'],
            category: 'PRO Solution',
            brand: 'Genosys',
            sku: 'GEN-015',
            images: ['https://genosys.ae/_next/image?url=%2Fimages%2FAWS.jpg&w=1200&q=75'],
            inStock: true,
            stockQuantity: 20,
            isFeatured: false,
            isNew: true,
            isOnSale: true,
            stock: 20,
            rating: 4.0,
            averageRating: 4.8,
            reviewCount: 156,
            sizeOptions: ['30ml', '60ml'],
            defaultSize: '30ml',
            createdAt: '2024-02-27T10:00:00.000Z',
            updatedAt: '2024-02-27T10:00:00.000Z'
          },
          {
            id: '16',
            name: 'Hair-GENTRON Device',
            description: 'Advanced hair growth device with red and blue light therapy for professional hair restoration',
            price: 299.99,
            originalPrice: 399.99,
            discountPercentage: 25,
            imageUrl: 'https://genosys.ae/_next/image?url=%2Fimages%2Fgen.jpg&w=1200&q=75',
            imageUrls: ['https://genosys.ae/_next/image?url=%2Fimages%2Fgen.jpg&w=1200&q=75'],
            category: 'Device',
            brand: 'Genosys',
            sku: 'GEN-016',
            images: ['https://genosys.ae/_next/image?url=%2Fimages%2Fgen.jpg&w=1200&q=75'],
            inStock: true,
            stockQuantity: 10,
            isFeatured: true,
            isNew: false,
            isOnSale: true,
            stock: 10,
            rating: 4.0,
            averageRating: 4.9,
            reviewCount: 89,
            createdAt: '2024-03-01T10:00:00.000Z',
            updatedAt: '2024-03-01T10:00:00.000Z'
          },
          {
            id: '17',
            name: 'HairGen Booster',
            description: 'Professional hair growth booster with advanced peptide technology for enhanced hair restoration',
            price: 149.99,
            originalPrice: 199.99,
            discountPercentage: 25,
            imageUrl: 'https://genosys.ae/_next/image?url=%2Fimages%2FBooster.jpg&w=1200&q=75',
            imageUrls: ['https://genosys.ae/_next/image?url=%2Fimages%2FBooster.jpg&w=1200&q=75'],
            category: 'Device',
            brand: 'Genosys',
            sku: 'GEN-017',
            images: ['https://genosys.ae/_next/image?url=%2Fimages%2FBooster.jpg&w=1200&q=75'],
            inStock: true,
            stockQuantity: 20,
            isFeatured: false,
            isNew: true,
            isOnSale: true,
            stock: 20,
            rating: 4.0,
            averageRating: 4.7,
            reviewCount: 67,
            createdAt: '2024-03-02T10:00:00.000Z',
            updatedAt: '2024-03-02T10:00:00.000Z'
          },
          {
            id: '18',
            name: 'Geno LED IR II',
            description: 'Professional LED light therapy device with infrared technology for advanced skin treatment',
            price: 399.99,
            originalPrice: 499.99,
            discountPercentage: 20,
            imageUrl: 'https://genosys.ae/_next/image?url=%2Fimages%2FLEDD.jpg&w=1200&q=75',
            imageUrls: ['https://genosys.ae/_next/image?url=%2Fimages%2FLEDD.jpg&w=1200&q=75'],
            category: 'Device',
            brand: 'Genosys',
            sku: 'GEN-018',
            images: ['https://genosys.ae/_next/image?url=%2Fimages%2FLEDD.jpg&w=1200&q=75'],
            inStock: true,
            stockQuantity: 8,
            isFeatured: true,
            isNew: false,
            isOnSale: true,
            stock: 8,
            rating: 4.0,
            averageRating: 4.8,
            reviewCount: 45,
            createdAt: '2024-03-03T10:00:00.000Z',
            updatedAt: '2024-03-03T10:00:00.000Z'
          },
          {
            id: '19',
            name: 'MOISTURE REPLENISHING HYALURON CREAM',
            description: 'Intensive moisture replenishing cream with hyaluronic acid for deep hydration and skin nourishment',
            price: 89.99,
            originalPrice: 119.99,
            discountPercentage: 25,
            imageUrl: 'https://genosys.ae/_next/image?url=%2Fimages%2FHER.jpg&w=1200&q=75',
            imageUrls: ['https://genosys.ae/_next/image?url=%2Fimages%2FHER.jpg&w=1200&q=75'],
            category: 'Cream',
            brand: 'Genosys',
            sku: 'GEN-019',
            images: ['https://genosys.ae/_next/image?url=%2Fimages%2FHER.jpg&w=1200&q=75'],
            inStock: true,
            stockQuantity: 35,
            isFeatured: false,
            isNew: true,
            isOnSale: true,
            stock: 35,
            rating: 4.0,
            averageRating: 4.6,
            reviewCount: 98,
            sizeOptions: ['50g', '250g'],
            defaultSize: '50g',
            createdAt: '2024-03-04T10:00:00.000Z',
            updatedAt: '2024-03-04T10:00:00.000Z'
          },
          {
            id: '20',
            name: 'INTENSIVE PROBLEM CONTROL CREAM',
            description: 'Advanced problem control cream for targeted treatment of skin concerns and blemish control',
            price: 99.99,
            originalPrice: 129.99,
            discountPercentage: 23,
            imageUrl: 'https://genosys.ae/_next/image?url=%2Fimages%2FPRB.jpg&w=1200&q=75',
            imageUrls: ['https://genosys.ae/_next/image?url=%2Fimages%2FPRB.jpg&w=1200&q=75'],
            category: 'Cream',
            brand: 'Genosys',
            sku: 'GEN-020',
            images: ['https://genosys.ae/_next/image?url=%2Fimages%2FPRB.jpg&w=1200&q=75'],
            inStock: true,
            stockQuantity: 28,
            isFeatured: false,
            isNew: true,
            isOnSale: true,
            stock: 28,
            rating: 4.0,
            averageRating: 4.5,
            reviewCount: 76,
            sizeOptions: ['50g', '250g'],
            defaultSize: '50g',
            createdAt: '2024-03-05T10:00:00.000Z',
            updatedAt: '2024-03-05T10:00:00.000Z'
          }
        ];

    this.featuredProducts = this.products.filter(p => p.isFeatured);
    this.newProducts = this.products.filter(product => 
      product.name.toLowerCase().includes('bio-ferment age defying powder mask') ||
      product.name.toLowerCase().includes('skin reboot pdrn mask pack')
    );
    this.categories = [
      { 
        id: 'skincare',
        name: 'Skincare', 
        slug: 'skincare',
        count: 15,
        isActive: true,
        sortOrder: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      { 
        id: 'hair-care',
        name: 'Hair Care', 
        slug: 'hair-care',
        count: 8,
        isActive: true,
        sortOrder: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      { 
        id: 'makeup',
        name: 'Makeup', 
        slug: 'makeup',
        count: 12,
        isActive: true,
        sortOrder: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      { 
        id: 'devices',
        name: 'Devices', 
        slug: 'devices',
        count: 5,
        isActive: true,
        sortOrder: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      { 
        id: 'anti-aging',
        name: 'Anti-Aging', 
        slug: 'anti-aging',
        count: 10,
        isActive: true,
        sortOrder: 4,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      { 
        id: 'beauty-tools',
        name: 'Beauty Tools', 
        slug: 'beauty-tools',
        count: 7,
        isActive: true,
        sortOrder: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  private transformProducts(dbProducts: any[]): Product[] {
    return dbProducts
      .filter(product => {
        // Remove duplicate blemish balm products - keep only the higher SPF version
        const name = product.name.toLowerCase();
        if (name.includes('intensive blemish balm cream') && name.includes('spf 30')) {
          console.log('🚫 Filtering out duplicate blemish balm product:', product.name);
          return false;
        }
        return true;
      })
      .map(product => {
        // Remove GENOSYS prefix from product names for cleaner display
        if (product.name && product.name.startsWith('GENOSYS ')) {
          product.name = product.name.replace('GENOSYS ', '');
        }
      
      // Map product categories based on product names
      const getCategory = (productName: string) => {
        const name = productName.toLowerCase();
        
        // Sun protection products (only actual sun creams)
        if (name.includes('sun cream') || name.includes('ultra shield') || name.includes('sun protection')) {
          return 'Sun';
        }
        
        // Cushion BB products (blemish balm products)
        if (name.includes('blemish balm') || name.includes('cushion') || name.includes('bb')) {
          return 'Cushion BB';
        }
        
        // Return original category if no specific mapping
        return product.category;
      };
      
      // Apply category mapping
      const originalCategory = product.category;
      product.category = getCategory(product.name);
      
      // Debug: Log category mapping for sun products
      if (product.name.toLowerCase().includes('sun') || product.name.toLowerCase().includes('ultra shield')) {
        console.log(`☀️ Category mapping for ${product.name}: ${originalCategory} -> ${product.category}`);
      }
      
      // Debug: Log category mapping for cushion products
      if (product.name.toLowerCase().includes('cushion') || product.name.toLowerCase().includes('blemish balm') || product.name.toLowerCase().includes('bb')) {
        console.log(`💄 Category mapping for ${product.name}: ${originalCategory} -> ${product.category}`);
      }
      
      // Create comprehensive product image mapping based on actual product names
      const getImageUrl = (productName: string) => {
        const name = productName.toLowerCase();
        
            // Specific product mappings for better visual representation
            if (name.includes('intensive repair collagen mask')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75';
            if (name.includes('bio-ferment age defying powder mask') || name.includes('bfad')) return 'https://genosys.ae/_next/image?url=%2Fimages%2FBFAD.png&w=1200&q=75';
            if (name.includes('skin reboot pdrn mask pack')) return 'https://genosys.ae/_next/image?url=%2Fimages%2FPDRN.png&w=1200&q=75';
            if (name.includes('eyecell eye zone care kit')) return 'https://genosys.ae/_next/image?url=%2Fimages%2FEYEZ.jpg&w=1200&q=75';
            if (name.includes('geno-led ir ii')) return 'https://genosys.ae/_next/image?url=%2Fimages%2FLEDD.jpg&w=1200&q=75';
            if (name.includes('hair-gentron')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fgen.jpg&w=1200&q=75';
        
        // Hair care products
        if (name.includes('hr³ matrix hair solution') || name.includes('hair solution')) return 'https://genosys.ae/_next/image?url=%2Fimages%2FHHR.jpg&w=1200&q=75';
        if (name.includes('hr³ matrix hair tonic') || name.includes('hair tonic')) return 'https://genosys.ae/_next/image?url=%2Fimages%2FHT.jpg&w=1200&q=75';
        if (name.includes('hr³ matrix mesopecia kit') || name.includes('mesopecia kit')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fmeso.jpg&w=1200&q=75';
        if (name.includes('hr³ matrix scalp peeling') || name.includes('scalp peeling')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fscal.jpg&w=1200&q=75';
        if (name.includes('hr³ matrix scalp shampoo') || name.includes('scalp shampoo')) return 'https://genosys.ae/_next/image?url=%2Fimages%2FSham.jpg&w=1200&q=75';
        if (name.includes('hairgen booster')) return 'https://genosys.ae/_next/image?url=%2Fimages%2FBooster.jpg&w=1200&q=75';
        
        // Skincare creams
        if (name.includes('blemish balm cream') || name.includes('blemish balm cushion')) return 'https://genosys.ae/_next/image?url=%2Fimages%2FBLEM.jpg&w=1200&q=75';
        if (name.includes('anti-wrinkle cream') || name.includes('nd cell')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75';
        if (name.includes('multi functional') && name.includes('cream')) return 'https://genosys.ae/_next/image?url=%2Fimages%2FANT.jpg&w=1200&q=75';
        if (name.includes('moisture replenishing') && name.includes('cream')) return 'https://genosys.ae/_next/image?url=%2Fimages%2FHER.jpg&w=1200&q=75';
        if (name.includes('intensive problem control cream')) return 'https://genosys.ae/_next/image?url=%2Fimages%2FPRB.jpg&w=1200&q=75';
        if (name.includes('intensive hydro soothing cream')) return 'https://genosys.ae/_next/image?url=%2Fimages%2FHSC.jpg&w=1200&q=75';
        if (name.includes('skin barrier protecting cream')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75';
        if (name.includes('egf repair oxymask cream')) return 'https://genosys.ae/_next/image?url=%2Fimages%2FEGF.jpg&w=1200&q=75';
        if (name.includes('soothing repair postcream')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75';
        if (name.includes('eyecell eye contour cream')) return 'https://genosys.ae/_next/image?url=%2Fimages%2FEC.jpg&w=1200&q=75';
        
        // Sun protection
        if (name.includes('sun cream') || name.includes('ultra shield')) return 'https://genosys.ae/_next/image?url=%2Fimages%2FSSUN.jpg&w=1200&q=75';
        
        // Cushion BB products
        if (name.includes('skin caring blemish balm cushion')) return 'https://genosys.ae/_next/image?url=%2Fimages%2FBBC.jpg&w=1200&q=75';
        
        // Masks
        if (name.includes('ez co₂ mask kit')) return 'https://genosys.ae/_next/image?url=%2Fimages%2FEZE.jpg&w=1200&q=75';
        if (name.includes('peptide gel mask')) return 'https://genosys.ae/_next/image?url=%2Fimages%2FPEP.jpg&w=1200&q=75';
        if (name.includes('soothing bomb sea algae mask')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75';
        if (name.includes('hydro cool modeling mask')) return 'https://genosys.ae/_next/image?url=%2Fimages%2FHYDR.jpg&w=1200&q=75';
        if (name.includes('skin rescue overnight cream mask')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75';
        
        // Eye care
        if (name.includes('eyecell eye peptide gel patch')) return 'https://genosys.ae/_next/image?url=%2Fimages%2FPatch.jpg&w=1200&q=75';
        
        // Serums
        if (name.includes('multi functional') && name.includes('serum')) return 'https://genosys.ae/_next/image?url=%2Fimages%2FMSSS.jpg&w=1200&q=75';
        if (name.includes('multi vita radiance serum')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75';
        if (name.includes('problem control serum')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75';
        if (name.includes('all for sensitive serum')) return 'https://genosys.ae/_next/image?url=%2Fimages%2FASE.jpg&w=1200&q=75';
        if (name.includes('moisture replenishing') && name.includes('serum')) return 'https://genosys.ae/_next/image?url=%2Fimages%2FHRS.jpg&w=1200&q=75';
        if (name.includes('eyecell eye contour serum')) return 'https://genosys.ae/_next/image?url=%2Fimages%2FEYS.jpg&w=1200&q=75';
        
        // Boosters and toners
        if (name.includes('snow booster')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75';
        if (name.includes('intensive problem control toner')) return 'https://genosys.ae/_next/image?url=%2Fimages%2FPRS.jpg&w=1200&q=75';
        if (name.includes('microbiome energy infusing mist')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fmist.jpg&w=1200&q=75';
        
        // Peeling and cleansing
        if (name.includes('skin renewal peeling system')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75';
        if (name.includes('epi turnover boosting peeling gel')) return 'https://genosys.ae/_next/image?url=%2Fimages%2FEPI.jpg&w=1200&q=75';
        if (name.includes('skin defender lip & eye makeup remover')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75';
        if (name.includes('snow o₂ cleanser')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75';
        
        // Power solutions
        if (name.includes('power solution cts')) return 'https://genosys.ae/_next/image?url=%2Fimages%2FCTS.jpg&w=1200&q=75';
        if (name.includes('power solution cvs')) return 'https://genosys.ae/_next/image?url=%2Fimages%2FCVS.jpg&w=1200&q=75';
        if (name.includes('power solution hes')) return 'https://genosys.ae/_next/image?url=%2Fimages%2FHES.jpg&w=1200&q=75';
        if (name.includes('power solution')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75';
        
        // Devices
        if (name.includes('microneedle roller')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fgenosys-microneedling-devices.jpg&w=1200&q=75';
        if (name.includes('needle pen-k')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75';
        
        // Multi vita radiance cream
        if (name.includes('multi vita radiance cream')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75';
        
        // Use the working image as fallback for all products
        return 'https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75';
      };

      const finalImageUrl = product.imageUrl || product.imageUrls?.[0] || getImageUrl(product.name);
      console.log(`🖼️ Product: ${product.name} -> Image: ${finalImageUrl}`);

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        originalPrice: product.originalPrice ? parseFloat(product.originalPrice) : undefined,
        discountPercentage: product.discountPercentage ? parseInt(product.discountPercentage) : undefined,
        imageUrl: finalImageUrl,
        imageUrls: product.imageUrls || [product.imageUrl] || [finalImageUrl],
        category: this.mapProductToCategory(product.name, product.category),
        brand: product.brand,
        sku: product.sku || `GEN-${product.id}`,
        images: product.imageUrls || [product.imageUrl] || [finalImageUrl],
        inStock: product.inStock !== undefined ? product.inStock : true,
        stockQuantity: product.stockQuantity || product.stock || 0,
        stock: product.stock || 0,
        isFeatured: product.isFeatured,
        isNew: product.isNew,
        isOnSale: product.isOnSale,
        rating: product.rating || product.averageRating ? parseFloat(product.averageRating) : 4.0,
        averageRating: product.averageRating ? parseFloat(product.averageRating) : 4.0,
        reviewCount: product.reviewCount ? parseInt(product.reviewCount) : 0,
        sizeOptions: this.getSizeOptions(product.name),
        defaultSize: this.getDefaultSize(product.name),
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      };
    });
  }

  private mapProductToCategory(productName: string, originalCategory?: string): string {
    const name = productName.toLowerCase();
    
    // Microneedling
    if (name.includes('microneedle') || name.includes('needle pen') || name.includes('roller')) {
      return 'Microneedling';
    }
    
    // PRO Solution (Power Solutions)
    if (name.includes('power solution') || name.includes('aws') || name.includes('pcs') || 
        name.includes('sws') || name.includes('cts') || name.includes('cvs') || 
        name.includes('hes')) {
      return 'PRO Solution';
    }
    
    // Cleanser
    if (name.includes('cleanser') || name.includes('snow o₂ cleanser') || 
        name.includes('makeup remover') || name.includes('defender')) {
      return 'Cleanser';
    }
    
    // Peeling
    if (name.includes('peeling') || name.includes('skin renewal peeling') || 
        name.includes('epi turnover') || name.includes('peeling system')) {
      return 'Peeling';
    }
    
    // Toner/Mist
    if (name.includes('toner') || name.includes('mist') || name.includes('microbiome energy infusing mist') ||
        name.includes('intensive problem control toner')) {
      return 'Toner/Mist';
    }
    
    // Eye Care (must come before Serum and Cream to catch EyeCell products)
    if (name.includes('eyecell') || name.includes('eye contour') || name.includes('eye peptide') || 
        name.includes('eye zone') || name.includes('eye care')) {
      return 'Eye Care';
    }
    
    // Serum
    if (name.includes('serum') || name.includes('all for sensitive') || 
        name.includes('anti-wrinkle serum') || name.includes('problem control serum') ||
        name.includes('moisture replenishing') && name.includes('serum')) {
      return 'Serum';
    }
    
    // Sun (must come before Cream to catch sun products)
    if (name.includes('sun cream') || name.includes('spf') || name.includes('ultra shield') ||
        name.includes('sun protection') || name.includes('multi sun cream')) {
      return 'Sun';
    }
    
    // Cushion BB (must come before Cream to catch cushion products)
    if (name.includes('cushion') || name.includes('bb') || name.includes('blemish balm cushion')) {
      return 'Cushion BB';
    }
    
    // Mask
    if (name.includes('mask') || name.includes('gel mask') || name.includes('collagen mask') ||
        name.includes('overnight') || name.includes('treatment') || name.includes('ez co₂ mask')) {
      return 'Mask';
    }
    
    // Cream (more specific to avoid catching sun and cushion products)
    if (name.includes('cream') && !name.includes('sun') && !name.includes('cushion') && 
        !name.includes('spf') && !name.includes('ultra shield') ||
        name.includes('moisturizer') || name.includes('anti-wrinkle cream') ||
        name.includes('intensive hydro soothing cream') || name.includes('intensive problem control cream')) {
      return 'Cream';
    }
    
    // Scalp/Hair
    if (name.includes('hr³ matrix') || name.includes('scalp') || 
        name.includes('hair tonic') || name.includes('hair solution') || name.includes('scalp shampoo')) {
      return 'Scalp/Hair';
    }
    
    
    // Device
    if (name.includes('device') || name.includes('geno-led') || name.includes('led') ||
        name.includes('equipment') || name.includes('tool') || name.includes('hair-gentron')) {
      return 'Device';
    }
    
    // Default fallback
    return originalCategory || 'Serum';
  }

  private transformCategories(dbCategories: any[]): Category[] {
    return dbCategories.map(cat => ({
      id: cat.category.toLowerCase().replace(/\s+/g, '-'),
      name: cat.category,
      slug: cat.category.toLowerCase().replace(/\s+/g, '-'),
      count: parseInt(cat.count),
      isActive: true,
      sortOrder: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
  }

  // Public methods
  getAllProducts(): Product[] {
    return this.products;
  }

  getFeaturedProducts(): Product[] {
    return this.featuredProducts;
  }

  getNewProducts(): Product[] {
    return this.newProducts;
  }

  getCategories(): Category[] {
    return this.categories;
  }

  getProductById(id: string): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  getProductsByCategory(category: string): Product[] {
    return this.products.filter(p => p.category === category);
  }

  searchProducts(query: string): Product[] {
    const lowercaseQuery = query.toLowerCase();
    return this.products.filter(p => 
      p.name.toLowerCase().includes(lowercaseQuery) ||
      p.description.toLowerCase().includes(lowercaseQuery) ||
      p.category.toLowerCase().includes(lowercaseQuery)
    );
  }

  isDatabaseConnected(): boolean {
    return this.isConnected;
  }

  private getSizeOptions(productName: string): string[] | undefined {
    const name = productName.toLowerCase();
    
    // Microneedle Roller
    if (name.includes('microneedle roller')) {
      return ['0.25mm', '0.5mm', '0.1mm', '0.15mm', '0.2mm'];
    }
    
    // Needle Pen-K
    if (name.includes('needle pen-k')) {
      return ['0.25mm', '0.5mm', '1.0mm'];
    }
    
    // Multi Functional Anti-Wrinkle Cream
    if (name.includes('multi functional anti-wrinkle cream')) {
      return ['30ml', '50ml'];
    }
    
    // Multi Functional Anti-Wrinkle Serum
    if (name.includes('multi functional anti-wrinkle serum')) {
      return ['15ml', '30ml'];
    }
    
    // Multi Sun Cream
    if (name.includes('multi sun cream')) {
      return ['50ml', '100ml'];
    }
    
    // Multi Vita Radiance Cream
    if (name.includes('multi vita radiance cream')) {
      return ['30ml', '60ml'];
    }
    
    // INTENSIVE HYDRO SOOTHING CREAM
    if (name.includes('intensive hydro soothing cream')) {
      return ['50g', '250g'];
    }
    
    // MOISTURE REPLENISHING HYALURON CREAM
    if (name.includes('moisture replenishing hyaluron cream')) {
      return ['50g', '250g'];
    }
    
    // INTENSIVE PROBLEM CONTROL CREAM
    if (name.includes('intensive problem control cream')) {
      return ['50g', '250g'];
    }
    
    // ND Cell ANTI-WRINKLE CREAM
    if (name.includes('nd cell anti-wrinkle cream')) {
      return ['30ml', '50ml'];
    }
    
    // PEPTIDE GEL MASK
    if (name.includes('peptide gel mask')) {
      return ['50ml', '100ml'];
    }
    
    // POWER SOLUTION AWS
    if (name.includes('power solution aws')) {
      return ['30ml', '60ml'];
    }
    
    return undefined;
  }

  private getDefaultSize(productName: string): string | undefined {
    const name = productName.toLowerCase();
    
    // Microneedle Roller
    if (name.includes('microneedle roller')) {
      return '0.25mm';
    }
    
    // Needle Pen-K
    if (name.includes('needle pen-k')) {
      return '0.25mm';
    }
    
    // Multi Functional Anti-Wrinkle Cream
    if (name.includes('multi functional anti-wrinkle cream')) {
      return '30ml';
    }
    
    // Multi Functional Anti-Wrinkle Serum
    if (name.includes('multi functional anti-wrinkle serum')) {
      return '30ml';
    }
    
    // Multi Sun Cream
    if (name.includes('multi sun cream')) {
      return '50ml';
    }
    
    // Multi Vita Radiance Cream
    if (name.includes('multi vita radiance cream')) {
      return '30ml';
    }
    
    // INTENSIVE HYDRO SOOTHING CREAM
    if (name.includes('intensive hydro soothing cream')) {
      return '50g';
    }
    
    // MOISTURE REPLENISHING HYALURON CREAM
    if (name.includes('moisture replenishing hyaluron cream')) {
      return '50g';
    }
    
    // INTENSIVE PROBLEM CONTROL CREAM
    if (name.includes('intensive problem control cream')) {
      return '50g';
    }
    
    // ND Cell ANTI-WRINKLE CREAM
    if (name.includes('nd cell anti-wrinkle cream')) {
      return '30ml';
    }
    
    // PEPTIDE GEL MASK
    if (name.includes('peptide gel mask')) {
      return '50ml';
    }
    
    // POWER SOLUTION AWS
    if (name.includes('power solution aws')) {
      return '30ml';
    }
    
    return undefined;
  }
}

// Export singleton instance
export const productService = ProductService.getInstance();
export default productService;
