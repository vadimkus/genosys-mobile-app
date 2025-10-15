import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import { productService } from '../services/productService';
import { PricingService } from '../services/pricingService';

interface UseProductDetailReturn {
  product: Product | null;
  loading: boolean;
  error: string | null;
  selectedSize: string;
  selectedColor: string;
  currentPrice: number;
  setSelectedSize: (size: string) => void;
  setSelectedColor: (color: string) => void;
  refreshProduct: () => Promise<void>;
}

export const useProductDetail = (productId: string): UseProductDetailReturn => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [currentPrice, setCurrentPrice] = useState(0);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const productData = await productService.getProductById(productId);
      setProduct(productData || null);

      // Initialize size and price
      if (productData) {
        const availableSizes = PricingService.getAvailableSizes(productData);
        if (availableSizes.length > 0) {
          const defaultSize = availableSizes[0];
          setSelectedSize(defaultSize);
          const price = PricingService.getPriceForSize(
            productData,
            defaultSize
          );
          setCurrentPrice(price);
        } else {
          setCurrentPrice(productData.price);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const handleSizeChange = useCallback(
    (size: string) => {
      if (!product) return;

      setSelectedSize(size);
      const price = PricingService.getPriceForSize(product, size);
      setCurrentPrice(price);
    },
    [product]
  );

  const handleColorChange = useCallback((color: string) => {
    setSelectedColor(color);
  }, []);

  const refreshProduct = useCallback(async () => {
    await fetchProduct();
  }, [fetchProduct]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return {
    product,
    loading,
    error,
    selectedSize,
    selectedColor,
    currentPrice,
    setSelectedSize: handleSizeChange,
    setSelectedColor: handleColorChange,
    refreshProduct,
  };
};
