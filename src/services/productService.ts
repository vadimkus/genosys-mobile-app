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
      console.log('📦 Loading products from database...');
      
      const [products, featured, newProducts, categories] = await Promise.all([
        getProducts(),
        getFeaturedProducts(),
        getNewProducts(),
        getCategories()
      ]);

      this.products = this.transformProducts(products);
      this.featuredProducts = this.transformProducts(featured);
      this.newProducts = this.transformProducts(newProducts);
      this.categories = this.transformCategories(categories);

      console.log(`✅ Loaded ${this.products.length} products, ${this.featuredProducts.length} featured, ${this.newProducts.length} new`);
    } catch (error) {
      console.error('❌ Error loading data from database:', error);
      await this.loadFallbackData();
    }
  }

  private async loadFallbackData(): Promise<void> {
    console.log('🏠 Loading fallback product data...');
    
    // Fallback data for when database is not available
    this.products = [
      {
        id: '1',
        name: 'Genosys Anti-Aging Cream',
        description: 'Premium anti-aging cream with advanced peptides',
        price: 89.99,
        originalPrice: 129.99,
        discountPercentage: 31,
        imageUrl: 'https://genosys.ae/images/products/anti-aging-cream.jpg',
        imageUrls: ['https://genosys.ae/images/products/anti-aging-cream.jpg'],
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
        description: 'Revolutionary hair growth serum with natural ingredients',
        price: 149.99,
        originalPrice: 199.99,
        discountPercentage: 25,
        imageUrl: 'https://genosys.ae/images/products/hair-serum.jpg',
        imageUrls: ['https://genosys.ae/images/products/hair-serum.jpg'],
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
      }
    ];

    this.featuredProducts = this.products.filter(p => p.isFeatured);
    this.newProducts = this.products.filter(p => p.isNew);
    this.categories = [
      { name: 'Skincare', count: 15 },
      { name: 'Hair Care', count: 8 },
      { name: 'Anti-Aging', count: 12 },
      { name: 'Beauty Devices', count: 5 }
    ];
  }

  private transformProducts(dbProducts: any[]): Product[] {
    return dbProducts.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      originalPrice: product.originalPrice ? parseFloat(product.originalPrice) : undefined,
      discountPercentage: product.discountPercentage ? parseInt(product.discountPercentage) : undefined,
      imageUrl: product.imageUrl || product.imageUrls?.[0] || 'https://via.placeholder.com/300x300',
      imageUrls: product.imageUrls || [product.imageUrl] || ['https://via.placeholder.com/300x300'],
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
    }));
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
