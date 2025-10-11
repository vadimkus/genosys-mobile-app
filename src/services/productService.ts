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
            // Create new products - only specific products for new arrivals
            this.newProducts = this.products
              .filter(product => 
                product.name.toLowerCase().includes('bio-ferment age defying powder mask') ||
                product.name.toLowerCase().includes('genosys skin reboot pdrn mask pack')
              );
            console.log('⚠️ New products API not available, using specific new arrival products.');
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
              .map(([name, count]) => ({ 
                id: name.toLowerCase().replace(/\s+/g, '-'),
                name, 
                slug: name.toLowerCase().replace(/\s+/g, '-'),
                count,
                isActive: true,
                sortOrder: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }))
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
            rating: 4.8,
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
            rating: 4.9,
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
            imageUrl: 'https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75',
            imageUrls: ['https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75'],
            category: 'Makeup',
            brand: 'Genosys',
            sku: 'GEN-003',
            images: ['https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75'],
            inStock: true,
            stockQuantity: 25,
            isFeatured: false,
            isNew: true,
            isOnSale: true,
            stock: 25,
            rating: 4.7,
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
            imageUrl: 'https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75',
            imageUrls: ['https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75'],
            category: 'Devices',
            brand: 'Genosys',
            sku: 'GEN-004',
            images: ['https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75'],
            inStock: true,
            stockQuantity: 15,
            isFeatured: true,
            isNew: false,
            isOnSale: true,
            stock: 15,
            rating: 4.6,
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
            rating: 4.5,
            averageRating: 4.5,
            reviewCount: 92,
            createdAt: '2024-01-30T10:00:00.000Z',
            updatedAt: '2024-01-30T10:00:00.000Z'
          }
        ];

    this.featuredProducts = this.products.filter(p => p.isFeatured);
    this.newProducts = this.products.filter(product => 
      product.name.toLowerCase().includes('bio-ferment age defying powder mask') ||
      product.name.toLowerCase().includes('genosys skin reboot pdrn mask pack')
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
    return dbProducts.map(product => {
      // Create comprehensive product image mapping based on actual product names
      const getImageUrl = (productName: string) => {
        const name = productName.toLowerCase();
        
            // Specific product mappings for better visual representation
            if (name.includes('intensive repair collagen mask')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75';
            if (name.includes('bio-ferment age defying powder mask') || name.includes('bfad')) return 'https://genosys.ae/_next/image?url=%2Fimages%2FBFAD.png&w=1200&q=75';
            if (name.includes('genosys skin reboot pdrn mask pack')) return 'https://genosys.ae/_next/image?url=%2Fimages%2FPDRN.png&w=1200&q=75';
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
        if (name.includes('multi functional') && name.includes('cream')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75';
        if (name.includes('moisture replenishing') && name.includes('cream')) return 'https://genosys.ae/_next/image?url=%2Fimages%2FHER.jpg&w=1200&q=75';
        if (name.includes('intensive problem control cream')) return 'https://genosys.ae/_next/image?url=%2Fimages%2FPRB.jpg&w=1200&q=75';
        if (name.includes('intensive hydro soothing cream')) return 'https://genosys.ae/_next/image?url=%2Fimages%2FHSC.jpg&w=1200&q=75';
        if (name.includes('skin barrier protecting cream')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75';
        if (name.includes('egf repair oxymask cream')) return 'https://genosys.ae/_next/image?url=%2Fimages%2FEGF.jpg&w=1200&q=75';
        if (name.includes('soothing repair postcream')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75';
        if (name.includes('eyecell eye contour cream')) return 'https://genosys.ae/_next/image?url=%2Fimages%2FEC.jpg&w=1200&q=75';
        
        // Sun protection
        if (name.includes('sun cream') || name.includes('ultra shield')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75';
        
        // Masks
        if (name.includes('ez co₂ mask kit')) return 'https://genosys.ae/_next/image?url=%2Fimages%2FEZE.jpg&w=1200&q=75';
        if (name.includes('peptide gel mask')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75';
        if (name.includes('soothing bomb sea algae mask')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75';
        if (name.includes('hydro cool modeling mask')) return 'https://genosys.ae/_next/image?url=%2Fimages%2FHYDR.jpg&w=1200&q=75';
        if (name.includes('skin rescue overnight cream mask')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75';
        
        // Eye care
        if (name.includes('eyecell eye peptide gel patch')) return 'https://genosys.ae/_next/image?url=%2Fimages%2FPatch.jpg&w=1200&q=75';
        
        // Serums
        if (name.includes('multi functional') && name.includes('serum')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75';
        if (name.includes('multi vita radiance serum')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75';
        if (name.includes('problem control serum')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75';
        if (name.includes('all for sensitive serum')) return 'https://genosys.ae/_next/image?url=%2Fimages%2FASE.jpg&w=1200&q=75';
        if (name.includes('moisture replenishing') && name.includes('serum')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75';
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
        if (name.includes('power solution')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75';
        
        // Devices
        if (name.includes('needle pen-k') || name.includes('microneedle roller')) return 'https://genosys.ae/_next/image?url=%2Fimages%2Fin.png&w=1200&q=75';
        
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
        category: product.category,
        brand: product.brand,
        sku: product.sku || `GEN-${product.id}`,
        images: product.imageUrls || [product.imageUrl] || [finalImageUrl],
        inStock: product.inStock !== undefined ? product.inStock : true,
        stockQuantity: product.stockQuantity || product.stock || 0,
        stock: product.stock || 0,
        isFeatured: product.isFeatured,
        isNew: product.isNew,
        isOnSale: product.isOnSale,
        rating: product.rating || product.averageRating ? parseFloat(product.averageRating) : 0,
        averageRating: product.averageRating ? parseFloat(product.averageRating) : 0,
        reviewCount: product.reviewCount ? parseInt(product.reviewCount) : 0,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      };
    });
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
}

// Export singleton instance
export const productService = ProductService.getInstance();
export default productService;
