import { getProducts, getFeaturedProducts, getNewProducts, getCategories, testConnection } from './database';
import { Product, Category } from '../types';

export class ProductService {
  private static instance: ProductService;
  private products: Product[] = [];
  private featuredProducts: Product[] = [];
  private newProducts: Product[] = [];
  private categories: Category[] = [];
  private isConnected = false;

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
            // Create new products from recently created products
            this.newProducts = this.products
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 6);
          } else {
            this.newProducts = this.transformProducts(newProducts);
          }
          
          if (categories.length === 0) {
            // Create categories from product categories
            const categoryMap = new Map();
            this.products.forEach(product => {
              if (product.category) {
                const count = categoryMap.get(product.category) || 0;
                categoryMap.set(product.category, count + 1);
              }
            });
            this.categories = Array.from(categoryMap.entries())
              .map(([name, count]) => ({ name, count }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 8);
          } else {
            this.categories = this.transformCategories(categories);
          }
        }
        
        console.log(`✅ Loaded ${this.products.length} products, ${this.featuredProducts.length} featured, ${this.newProducts.length} new from API`);
      } else {
        // No data from API, use fallback
        console.log('⚠️ No data from API, using fallback data');
        await this.loadFallbackData();
      }
    } catch (error) {
      console.error('❌ Error loading data from API:', error);
      await this.loadFallbackData();
    }
  }

  private async loadFallbackData(): Promise<void> {
    console.log('🏠 Loading fallback product data...');
    
        // Fallback data for when API is not available
        this.products = [
          {
            id: '1',
            name: 'Genosys Anti-Aging Cream',
            description: 'Premium anti-aging cream with advanced peptides and Korean skincare technology',
            price: 89.99,
            originalPrice: 129.99,
            discountPercentage: 31,
            imageUrl: 'https://genosys.ae/_next/image?url=%2Fimages%2Fcream%2Fanti-wrinkle-cream.png&w=1200&q=75',
            imageUrls: ['https://genosys.ae/_next/image?url=%2Fimages%2Fcream%2Fanti-wrinkle-cream.png&w=1200&q=75'],
            category: 'Skincare',
            brand: 'Genosys',
            isActive: true,
            isFeatured: true,
            isNew: false,
            isOnSale: true,
            stock: 50,
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
            imageUrl: 'https://genosys.ae/_next/image?url=%2Fimages%2Fhair%2Fhair-care.png&w=1200&q=75',
            imageUrls: ['https://genosys.ae/_next/image?url=%2Fimages%2Fhair%2Fhair-care.png&w=1200&q=75'],
            category: 'Hair Care',
            brand: 'Genosys',
            isActive: true,
            isFeatured: true,
            isNew: true,
            isOnSale: true,
            stock: 30,
            averageRating: 4.9,
            reviewCount: 89,
            createdAt: '2024-01-20T10:00:00.000Z',
            updatedAt: '2024-01-20T10:00:00.000Z'
          },
          {
            id: '3',
            name: 'Skin Care Blemish Balm Cushion',
            description: 'Premium BB cushion with skin caring properties and natural coverage',
            price: 79.99,
            originalPrice: 99.99,
            discountPercentage: 20,
            imageUrl: 'https://genosys.ae/_next/image?url=%2Fimages%2Fcushion%2Fblemish-balm-cushion.png&w=1200&q=75',
            imageUrls: ['https://genosys.ae/_next/image?url=%2Fimages%2Fcushion%2Fblemish-balm-cushion.png&w=1200&q=75'],
            category: 'Makeup',
            brand: 'Genosys',
            isActive: true,
            isFeatured: false,
            isNew: true,
            isOnSale: true,
            stock: 25,
            averageRating: 4.7,
            reviewCount: 156,
            createdAt: '2024-01-25T10:00:00.000Z',
            updatedAt: '2024-01-25T10:00:00.000Z'
          },
          {
            id: '4',
            name: 'Hair-GENTRON Device',
            description: 'Advanced hair growth device with red and blue light therapy',
            price: 299.99,
            originalPrice: 399.99,
            discountPercentage: 25,
            imageUrl: 'https://genosys.ae/_next/image?url=%2Fimages%2Fdevices%2Fhair-gentron.png&w=1200&q=75',
            imageUrls: ['https://genosys.ae/_next/image?url=%2Fimages%2Fdevices%2Fhair-gentron.png&w=1200&q=75'],
            category: 'Devices',
            brand: 'Genosys',
            isActive: true,
            isFeatured: true,
            isNew: false,
            isOnSale: true,
            stock: 15,
            averageRating: 4.6,
            reviewCount: 78,
            createdAt: '2024-01-10T10:00:00.000Z',
            updatedAt: '2024-01-10T10:00:00.000Z'
          },
          {
            id: '5',
            name: 'ND Cell Anti-Wrinkle Cream',
            description: 'Advanced anti-wrinkle cream with ND Cell technology',
            price: 119.99,
            originalPrice: 149.99,
            discountPercentage: 20,
            imageUrl: 'https://genosys.ae/_next/image?url=%2Fimages%2Fcream%2Fnd-cell-cream.png&w=1200&q=75',
            imageUrls: ['https://genosys.ae/_next/image?url=%2Fimages%2Fcream%2Fnd-cell-cream.png&w=1200&q=75'],
            category: 'Skincare',
            brand: 'Genosys',
            isActive: true,
            isFeatured: false,
            isNew: true,
            isOnSale: true,
            stock: 40,
            averageRating: 4.5,
            reviewCount: 92,
            createdAt: '2024-01-30T10:00:00.000Z',
            updatedAt: '2024-01-30T10:00:00.000Z'
          }
        ];

    this.featuredProducts = this.products.filter(p => p.isFeatured);
    this.newProducts = this.products.filter(p => p.isNew);
    this.categories = [
      { name: 'Skincare', count: 15 },
      { name: 'Hair Care', count: 8 },
      { name: 'Makeup', count: 12 },
      { name: 'Devices', count: 5 },
      { name: 'Anti-Aging', count: 10 },
      { name: 'Beauty Tools', count: 7 }
    ];
  }

  private transformProducts(dbProducts: any[]): Product[] {
    return dbProducts.map(product => {
      // Create actual product image URLs based on product name
      const getImageUrl = (productName: string) => {
        const name = productName.toLowerCase();
        
        // Map product names to actual Genosys product images
        if (name.includes('collagen mask')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75';
        if (name.includes('hair-gentron')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fdevices%2Fhair-gentron.png&w=1200&q=75';
        if (name.includes('hairgen')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fdevices%2Fhairgen-booster.png&w=1200&q=75';
        if (name.includes('needle')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fdevices%2Fneedle-pen-k.png&w=1200&q=75';
        if (name.includes('cushion')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fcushion%2Fblemish-balm-cushion.png&w=1200&q=75';
        if (name.includes('cream')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fcream%2Fanti-wrinkle-cream.png&w=1200&q=75';
        if (name.includes('mask')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fmask%2Fcollagen-mask.png&w=1200&q=75';
        if (name.includes('serum')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fserum%2Fanti-wrinkle-serum.png&w=1200&q=75';
        if (name.includes('toner')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Ftoner%2Fproblem-control-toner.png&w=1200&q=75';
        if (name.includes('cleanser')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fcleanser%2Fsnow-cleanser.png&w=1200&q=75';
        if (name.includes('device')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fdevices%2Fdevice.png&w=1200&q=75';
        if (name.includes('hair')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fhair%2Fhair-care.png&w=1200&q=75';
        if (name.includes('skin')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fskin%2Fskin-care.png&w=1200&q=75';
        if (name.includes('eye')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Feye%2Feye-care.png&w=1200&q=75';
        if (name.includes('sun')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fsun%2Fsun-cream.png&w=1200&q=75';
        if (name.includes('power solution')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fpower%2Fpower-solution.png&w=1200&q=75';
        
        // Fallback to a generic Genosys product image
        return 'https://genosys.ae/_next/image?url=%2Fimages%2Fproducts%2Fdefault.png&w=1200&q=75';
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
        category: product.category,
        brand: product.brand,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        isNew: product.isNew,
        isOnSale: product.isOnSale,
        stock: product.stock,
        averageRating: product.averageRating ? parseFloat(product.averageRating) : 0,
        reviewCount: product.reviewCount ? parseInt(product.reviewCount) : 0,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      };
    });
  }

  private transformCategories(dbCategories: any[]): Category[] {
    return dbCategories.map(cat => ({
      name: cat.category,
      count: parseInt(cat.count)
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
}

// Export singleton instance
export const productService = ProductService.getInstance();
export default productService;
