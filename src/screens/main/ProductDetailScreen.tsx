import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  StatusBar,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { productService } from '../../services/productService';
import { Product } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type ProductDetailScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function ProductDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation<ProductDetailScreenNavigationProp>();
  const { addToCart } = useCart();
  const { theme } = useTheme();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');

  const getPriceForSize = (product: Product, size: string) => {
    if (!product || !size) return product?.price || 0;
    
    // Define size-based pricing for different products
    const name = product.name.toLowerCase();
    
    // INTENSIVE HYDRO SOOTHING CREAM
    if (name.includes('intensive hydro soothing cream')) {
      if (size === '50g') return 290.00;  // Homecare size - Real price from genosys.ae
      if (size === '250g') return 420.00;  // Professional size - Real price from genosys.ae
    }
    
    // MOISTURE REPLENISHING HYALURON CREAM
    if (name.includes('moisture replenishing hyaluron cream')) {
      if (size === '50g') return 290.00;  // Same pricing as hydro soothing cream
      if (size === '250g') return 420.00;  // Same pricing as hydro soothing cream
    }
    
    // INTENSIVE PROBLEM CONTROL CREAM
    if (name.includes('intensive problem control cream')) {
      if (size === '50g') return 290.00;  // Same pricing as hydro soothing cream
      if (size === '250g') return 420.00;  // Same pricing as hydro soothing cream
    }
    
    // MULTI FUNCTIONAL ANTI-WRINKLE CREAM
    if (name.includes('multi functional anti-wrinkle cream')) {
      if (size === '30ml') return 290.00;  // Same pricing as other creams
      if (size === '50ml') return 420.00;  // Same pricing as other creams
    }
    
    // MULTI FUNCTIONAL ANTI-WRINKLE SERUM
    if (name.includes('multi functional anti-wrinkle serum')) {
      if (size === '15ml') return 99.99;
      if (size === '30ml') return 159.99;
    }
    
    // MULTI SUN CREAM
    if (name.includes('multi sun cream')) {
      if (size === '50ml') return 79.99;
      if (size === '100ml') return 129.99;
    }
    
    // MULTI VITA RADIANCE CREAM
    if (name.includes('multi vita radiance cream')) {
      if (size === '30ml') return 290.00;  // Same pricing as hydro soothing cream
      if (size === '60ml') return 420.00;  // Same pricing as hydro soothing cream
    }
    
    // ND Cell ANTI-WRINKLE CREAM
    if (name.includes('nd cell anti-wrinkle cream')) {
      if (size === '30ml') return 149.99;
      if (size === '50ml') return 229.99;
    }
    
    // PEPTIDE GEL MASK
    if (name.includes('peptide gel mask')) {
      if (size === '50ml') return 89.99;
      if (size === '100ml') return 149.99;
    }
    
    // POWER SOLUTION AWS
    if (name.includes('power solution aws')) {
      if (size === '30ml') return 119.99;
      if (size === '60ml') return 189.99;
    }
    
    // Microneedle Roller
    if (name.includes('microneedle roller')) {
      if (size === '0.25mm') return 49.99;
      if (size === '0.5mm') return 59.99;
      if (size === '0.1mm') return 39.99;
      if (size === '0.15mm') return 44.99;
      if (size === '0.2mm') return 49.99;
    }
    
    // Needle Pen-K
    if (name.includes('needle pen-k')) {
      if (size === '0.25mm') return 149.99;
      if (size === '0.5mm') return 169.99;
      if (size === '1.0mm') return 189.99;
    }
    
    // Default to original price if no size-specific pricing
    return product.price;
  };

  const getProductDetails = (product: Product) => {
    const name = product.name.toLowerCase();
    
    // INTENSIVE HYDRO SOOTHING CREAM
    if (name.includes('intensive hydro soothing cream')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Intensive hydro soothing cream</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size Options:</Text> 50g (Homecare) / 250g (Professional)</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Hydration, soothing, skin repair, barrier protection</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially sensitive and irritated skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Professional and home care</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // MULTI FUNCTIONAL ANTI-WRINKLE CREAM
    if (name.includes('multi functional anti-wrinkle cream')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Multi-functional anti-wrinkle cream</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size Options:</Text> 30ml / 50ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Anti-aging, wrinkle reduction, skin firmness, hydration</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially mature and aging skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily anti-aging care, morning and evening</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // MULTI FUNCTIONAL ANTI-WRINKLE SERUM
    if (name.includes('multi functional anti-wrinkle serum')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Multi-functional anti-wrinkle serum</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size Options:</Text> 15ml / 30ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Advanced anti-aging, wrinkle reduction, skin renewal</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially mature and aging skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily treatment, morning and evening</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // MULTI SUN CREAM
    if (name.includes('multi sun cream')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Multi-functional sun protection cream</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size Options:</Text> 50ml / 100ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>SPF Rating:</Text> SPF 40 PA++</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> UV protection, anti-aging, skin brightening</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily sun protection, morning application</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // MULTI VITA RADIANCE CREAM
    if (name.includes('multi vita radiance cream')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Multi-vitamin radiance cream</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size Options:</Text> 30ml / 60ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Skin brightening, radiance, vitamin nourishment</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially dull skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily care, morning and evening</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // ND Cell ANTI-WRINKLE CREAM
    if (name.includes('nd cell anti-wrinkle cream')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> ND Cell anti-wrinkle cream</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size Options:</Text> 30ml / 50ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Advanced anti-wrinkle, skin rejuvenation, ND Cell technology</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially aging skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily anti-aging care</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // PEPTIDE GEL MASK
    if (name.includes('peptide gel mask')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Peptide gel mask</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size Options:</Text> 50ml / 100ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Intensive skin rejuvenation, anti-aging, peptide therapy</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> 2-3 times per week for intensive treatment</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // POWER SOLUTION AWS
    if (name.includes('power solution aws')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Power Solution AWS</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size Options:</Text> 30ml / 60ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Advanced skin treatment, AWS technology, optimal results</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Professional treatment solution</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // Microneedle Roller
    if (name.includes('microneedle roller')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Professional microneedle roller</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Needle Sizes:</Text> 0.25mm, 0.5mm, 0.1mm, 0.15mm, 0.2mm</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Skin rejuvenation, collagen stimulation, advanced treatment</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Professional microneedling treatment</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // Needle Pen-K
    if (name.includes('needle pen-k')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Professional needle pen device</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Needle Sizes:</Text> 0.25mm, 0.5mm, 1.0mm</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Advanced skin treatment, precision application</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Professional skin treatment device</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // HR³ MATRIX SCALP SHAMPOO α
    if (name.includes('hr³ matrix scalp shampoo') || name.includes('scalp shampoo')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Professional scalp shampoo</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 300ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Scalp cleansing, hair growth support, professional treatment</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Hair Type:</Text> All hair types, especially thinning hair</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Professional scalp treatment, 2-3 times per week</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // HR³ MATRIX HAIR SOLUTION α
    if (name.includes('hr³ matrix hair solution') || name.includes('hair solution')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Professional hair growth solution</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 100ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Hair growth stimulation, scalp health, professional treatment</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Hair Type:</Text> All hair types, especially thinning hair</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Professional hair treatment, daily application</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // HR³ MATRIX HAIR TONIC α
    if (name.includes('hr³ matrix hair tonic') || name.includes('hair tonic')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Professional hair tonic</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 150ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Hair strengthening, scalp nourishment, growth support</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Hair Type:</Text> All hair types, especially weak hair</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily hair care, morning and evening</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // HairGen BOOSTER
    if (name.includes('hairgen booster')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Hair growth booster</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 50ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Hair growth acceleration, scalp stimulation, professional results</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Hair Type:</Text> All hair types, especially slow-growing hair</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Professional hair treatment, 2-3 times per week</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // Hair-GENTRON Device
    if (name.includes('hair-gentron')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Professional hair growth device</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Technology:</Text> Red and blue light therapy</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Hair growth stimulation, scalp health, professional treatment</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Hair Type:</Text> All hair types, especially thinning hair</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Professional hair treatment device</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // INTENSIVE PROBLEM CONTROL CREAM
    if (name.includes('intensive problem control cream')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Intensive problem control cream</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 50ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Problem skin treatment, acne control, skin healing</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> Problem skin, acne-prone skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily problem skin care, morning and evening</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // INTENSIVE PROBLEM CONTROL TONER
    if (name.includes('intensive problem control toner')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Intensive problem control toner</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 200ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Problem skin treatment, pore cleansing, skin balancing</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> Problem skin, oily skin, acne-prone skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily skin care, morning and evening</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // INTENSIVE BLEMISH BALM CREAM
    if (name.includes('intensive blemish balm cream')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Intensive blemish balm cream with SPF</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>SPF Rating:</Text> SPF 30 PA++</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 50ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Blemish coverage, sun protection, skin care</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially blemish-prone skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily sun protection and coverage</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // MOISTURE REPLENISHING HYALURON CREAM
    if (name.includes('moisture replenishing hyaluron cream')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Moisture replenishing hyaluron cream</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 50ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Deep hydration, moisture replenishment, skin plumping</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially dry skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily moisturizing care, morning and evening</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // MOISTURE REPLENISHING HYALURON SERUM
    if (name.includes('moisture replenishing hyaluron serum')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Moisture replenishing hyaluron serum</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 30ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Intensive hydration, moisture boost, skin plumping</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially dry and dehydrated skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily hydration treatment, morning and evening</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // HYDRO COOL MODELING MASK
    if (name.includes('hydro cool modeling mask')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Hydro cool modeling mask</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 1000g</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Cooling effect, skin firming, modeling treatment</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially tired skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Professional modeling treatment, 1-2 times per week</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // EyeCell EYE CONTOUR SERUM
    if (name.includes('eyecell eye contour serum')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Eye contour serum</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 15ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Eye area treatment, anti-aging, dark circle reduction</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially aging eye area</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily eye care, morning and evening</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // MICROBIOME ENERGY INFUSING MIST
    if (name.includes('microbiome energy infusing mist')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Microbiome energy infusing mist</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 150ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Skin microbiome balance, energy infusion, skin revitalization</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially tired skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily skin misting, morning and evening</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // Genosys Anti-Aging Cream
    if (name.includes('genosys anti-aging cream')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Premium anti-aging cream</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 50ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Anti-aging, wrinkle reduction, skin firmness, premium care</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially mature skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily anti-aging care, morning and evening</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // Hair Growth Serum
    if (name.includes('hair growth serum')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Revolutionary hair growth serum</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 100ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Hair growth stimulation, natural ingredients, advanced technology</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Hair Type:</Text> All hair types, especially thinning hair</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily hair treatment, morning and evening</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // Skin Care Blemish Balm Cushion
    if (name.includes('skin care blemish balm cushion')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Premium BB cushion with skin care</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 15g</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Natural coverage, skin caring properties, blemish coverage</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially blemish-prone skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily coverage and skin care</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // EGF REPAIR OXYMASK CREAM
    if (name.includes('egf repair oxymask cream')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> EGF repair oxymask cream</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 50ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> EGF repair, oxygen therapy, skin rejuvenation</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially damaged skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Professional repair treatment, 2-3 times per week</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // SOOTHING REPAIR POSTCREAM
    if (name.includes('soothing repair postcream')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Soothing repair post-treatment cream</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 50ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Post-treatment soothing, skin repair, calming care</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially sensitive skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Post-treatment care, daily application</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // EyeCell EYE CONTOUR CREAM
    if (name.includes('eyecell eye contour cream')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Eye contour cream</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 30ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Eye area care, anti-aging, dark circle reduction</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially aging eye area</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily eye care, morning and evening</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // SKIN BARRIER PROTECTING CREAM
    if (name.includes('skin barrier protecting cream')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Skin barrier protecting cream</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 50ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Skin barrier protection, moisture retention, skin health</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially sensitive skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily barrier protection, morning and evening</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // ULTRA SHIELD SUN CREAM
    if (name.includes('ultra shield sun cream')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Ultra shield sun protection cream</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>SPF Rating:</Text> SPF 50+ PA+++</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 60ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Maximum UV protection, anti-aging, skin care</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily sun protection, morning application</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // EZ CO₂ MASK KIT
    if (name.includes('ez co₂ mask kit')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> EZ CO₂ mask kit</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> Kit (Multiple components)</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> CO₂ therapy, skin rejuvenation, professional treatment</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially aging skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Professional CO₂ treatment, 1-2 times per week</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // SOOTHING BOMB SEA ALGAE MASK
    if (name.includes('soothing bomb sea algae mask')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Soothing bomb sea algae mask</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 100ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Soothing effect, sea algae benefits, skin calming</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially sensitive skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Soothing treatment, 2-3 times per week</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // SKIN RESCUE OVERNIGHT CREAM MASK
    if (name.includes('skin rescue overnight cream mask')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Skin rescue overnight cream mask</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 50ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Overnight skin rescue, intensive repair, skin recovery</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially damaged skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Overnight treatment, 2-3 times per week</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // EyeCell EYE PEPTIDE GEL PATCH
    if (name.includes('eyecell eye peptide gel patch')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Eye peptide gel patch</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 30 patches</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Eye area treatment, peptide therapy, anti-aging</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially aging eye area</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Eye patch treatment, 2-3 times per week</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // MULTI VITA RADIANCE SERUM
    if (name.includes('multi vita radiance serum')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Multi-vitamin radiance serum</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 30ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Skin brightening, radiance boost, vitamin nourishment</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially dull skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily radiance treatment, morning and evening</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // PROBLEM CONTROL SERUM
    if (name.includes('problem control serum')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Problem control serum</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 30ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Problem skin treatment, acne control, skin healing</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> Problem skin, acne-prone skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily problem skin treatment, morning and evening</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // ALL FOR SENSITIVE SERUM
    if (name.includes('all for sensitive serum')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 30ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> Sensitive, reactive, and easily irritated skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Formulation:</Text> Gentle, non-irritating serum</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Barrier repair, anti-inflammatory, soothing</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Apply to clean skin morning and evening, gently pat until absorbed</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // INTENSIVE REPAIR COLLAGEN MASK
    if (name.includes('intensive repair collagen mask')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Intensive repair collagen mask</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 30ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Intensive repair, collagen therapy, skin rejuvenation</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially damaged skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Intensive repair treatment, 2-3 times per week</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // BIO-FERMENT AGE DEFYING POWDER MASK
    if (name.includes('bio-ferment age defying powder mask') || name.includes('bfad')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Bio-ferment age defying powder mask</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 50g</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Age defying, bio-ferment technology, anti-aging</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially aging skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Age defying treatment, 2-3 times per week</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // GENOSYS SKIN REBOOT PDRN MASK PACK
    if (name.includes('genosys skin reboot pdrn mask pack')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Genosys skin reboot PDRN mask pack</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 30ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Skin reboot, PDRN therapy, skin regeneration</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially damaged skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Skin reboot treatment, 2-3 times per week</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // EyeCell EYE ZONE CARE KIT
    if (name.includes('eyecell eye zone care kit')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Eye zone care kit</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> Kit (Multiple components)</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Comprehensive eye care, anti-aging, dark circle reduction</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially aging eye area</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Complete eye care routine, daily application</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // GENO-LED IR II
    if (name.includes('geno-led ir ii')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Geno-LED IR II device</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Technology:</Text> LED and infrared therapy</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Skin rejuvenation, LED therapy, infrared treatment</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Professional LED treatment device</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // HR³ MATRIX MESOPECIA KIT
    if (name.includes('hr³ matrix mesopecia kit') || name.includes('mesopecia kit')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> HR³ Matrix mesopecia kit</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> Kit (Multiple components)</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Mesopecia treatment, hair growth, scalp health</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Hair Type:</Text> All hair types, especially thinning hair</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Professional mesopecia treatment kit</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // HR³ MATRIX SCALP PEELING
    if (name.includes('hr³ matrix scalp peeling') || name.includes('scalp peeling')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> HR³ Matrix scalp peeling</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 100ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Scalp exfoliation, hair growth support, scalp health</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Hair Type:</Text> All hair types, especially oily scalp</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Scalp peeling treatment, 1-2 times per week</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // ND Cell Anti-Wrinkle Cream (Original)
    if (name.includes('nd cell anti-wrinkle cream') && !name.includes('nd cell anti-wrinkle cream')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> ND Cell anti-wrinkle cream</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 50ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Advanced anti-wrinkle, ND Cell technology, skin rejuvenation</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially aging skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily anti-aging care, morning and evening</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // MELAZERO SERUM
    if (name.includes('melazero serum')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> MELAZERO® melanin care serum</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 30ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Skin brightening, melanin control, even skin tone</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially dull and uneven skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily brightening treatment, morning and evening</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // VITAMIN C BRIGHTENING SERUM
    if (name.includes('vitamin c brightening serum')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Vitamin C brightening serum</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 30ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Vitamin C brightening, antioxidant protection, skin radiance</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially dull skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily brightening treatment, morning application</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // NIACINAMIDE PORE MINIMIZING SERUM
    if (name.includes('niacinamide pore minimizing serum')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Niacinamide pore minimizing serum</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 30ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Pore minimizing, oil control, skin balancing</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially oily and combination skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily pore care, morning and evening</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // RETINOL ANTI-AGING SERUM
    if (name.includes('retinol anti-aging serum')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Retinol anti-aging serum</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 30ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Advanced anti-aging, wrinkle reduction, skin renewal</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially mature skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Evening anti-aging treatment, start with 2-3 times per week</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // PEPTIDE ANTI-AGING SERUM
    if (name.includes('peptide anti-aging serum')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Peptide anti-aging serum</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 30ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Peptide therapy, anti-aging, skin firmness</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially aging skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily anti-aging treatment, morning and evening</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // HYALURONIC ACID HYDRATING SERUM
    if (name.includes('hyaluronic acid hydrating serum')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Hyaluronic acid hydrating serum</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 30ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Deep hydration, moisture retention, skin plumping</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially dry and dehydrated skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily hydration treatment, morning and evening</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // GENTLE CLEANSING FOAM
    if (name.includes('gentle cleansing foam')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Gentle cleansing foam</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 150ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Gentle cleansing, skin balance, pore cleansing</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially sensitive skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily cleansing, morning and evening</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // DEEP CLEANSING FOAM
    if (name.includes('deep cleansing foam')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Deep cleansing foam</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 150ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Deep pore cleansing, oil removal, skin purification</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially oily and combination skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily deep cleansing, morning and evening</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // EXFOLIATING CLEANSING GEL
    if (name.includes('exfoliating cleansing gel')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Exfoliating cleansing gel</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 150ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Gentle exfoliation, dead skin removal, skin renewal</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially dull skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Exfoliating treatment, 2-3 times per week</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // TONING SOLUTION
    if (name.includes('toning solution')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Toning solution</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 200ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Skin balancing, pH restoration, pore tightening</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily skin care, morning and evening</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // AHA BHA PEELING SOLUTION
    if (name.includes('aha bha peeling solution')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> AHA BHA peeling solution</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 30ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Chemical exfoliation, skin renewal, pore unclogging</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially dull and congested skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Peeling treatment, 1-2 times per week</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // GLYCOLIC ACID PEELING GEL
    if (name.includes('glycolic acid peeling gel')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Glycolic acid peeling gel</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 100ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Gentle peeling, dead skin removal, skin renewal</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially dull skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Peeling treatment, 1-2 times per week</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // ENZYME PEELING POWDER
    if (name.includes('enzyme peeling powder')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Enzyme peeling powder</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 50g</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Gentle enzyme exfoliation, skin renewal, natural peeling</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially sensitive skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Enzyme peeling treatment, 1-2 times per week</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // EPI TURNOVER BOOSTING PEELING GEL
    if (name.includes('epi turnover boosting peeling gel')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Form:</Text> Enzyme-based peeling gel</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 100g</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, including sensitive skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Technology:</Text> Natural enzyme exfoliation</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Gentle exfoliation, radiance enhancement, pore purification</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> 1-2 times per week</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // CLAY DETOX MASK
    if (name.includes('clay detox mask')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Clay detox mask</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 100ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Deep detoxification, pore cleansing, oil absorption</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially oily and combination skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Detox treatment, 1-2 times per week</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // CHARCOAL PURIFYING MASK
    if (name.includes('charcoal purifying mask')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Charcoal purifying mask</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 100ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Deep purification, pore cleansing, toxin removal</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially oily and congested skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Purifying treatment, 1-2 times per week</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // HYDROGEL MOISTURIZING MASK
    if (name.includes('hydrogel moisturizing mask')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Hydrogel moisturizing mask</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 30ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Intensive hydration, moisture boost, skin plumping</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially dry and dehydrated skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Hydrating treatment, 2-3 times per week</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // COLLAGEN FIRMING MASK
    if (name.includes('collagen firming mask')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Collagen firming mask</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 30ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Skin firming, collagen therapy, anti-aging</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially aging skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Firming treatment, 2-3 times per week</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // VITAMIN C BRIGHTENING MASK
    if (name.includes('vitamin c brightening mask')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Vitamin C brightening mask</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 30ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Skin brightening, vitamin C therapy, radiance boost</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially dull skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Brightening treatment, 2-3 times per week</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // ANTI-AGING NIGHT CREAM
    if (name.includes('anti-aging night cream')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Anti-aging night cream</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 50ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Overnight anti-aging, skin renewal, wrinkle reduction</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially mature skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Night care, evening application</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // MOISTURIZING DAY CREAM
    if (name.includes('moisturizing day cream')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Moisturizing day cream</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 50ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Daily hydration, skin protection, moisture retention</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially dry skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily moisturizing care, morning application</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // SENSITIVE SKIN CREAM
    if (name.includes('sensitive skin cream')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Sensitive skin cream</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 50ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Gentle care, skin soothing, barrier protection</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> Sensitive skin, reactive skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily sensitive skin care, morning and evening</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // ACNE TREATMENT GEL
    if (name.includes('acne treatment gel')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Acne treatment gel</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 30ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Acne control, blemish treatment, skin healing</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> Acne-prone skin, problem skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Targeted acne treatment, morning and evening</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // DARK SPOT CORRECTING SERUM
    if (name.includes('dark spot correcting serum')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Dark spot correcting serum</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 30ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Dark spot reduction, skin brightening, even skin tone</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially uneven skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Targeted dark spot treatment, morning and evening</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // EYE CREAM FOR DARK CIRCLES
    if (name.includes('eye cream for dark circles')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Eye cream for dark circles</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 15ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Dark circle reduction, eye area care, anti-aging</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially aging eye area</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily eye care, morning and evening</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // LIP CARE BALM
    if (name.includes('lip care balm')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Lip care balm</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 10ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Lip hydration, protection, softness</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily lip care, as needed</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // HAND CREAM
    if (name.includes('hand cream')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Hand cream</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 100ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Hand hydration, protection, softness</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily hand care, as needed</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // BODY LOTION
    if (name.includes('body lotion')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Body lotion</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 200ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Body hydration, skin nourishment, softness</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily body care, morning and evening</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // FACIAL CLEANSING BRUSH
    if (name.includes('facial cleansing brush')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Facial cleansing brush</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Technology:</Text> Sonic vibration technology</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Deep cleansing, pore cleansing, skin exfoliation</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily cleansing device, morning and evening</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // Default generic details for other products
    return (
      <>
        <Text style={styles.detailItem}><Text style={styles.detailLabel}>Form:</Text> {product.category === 'Serum' ? 'Advanced skin brightening serum' : product.category === 'Cream' ? 'Professional skincare cream' : product.category === 'Mask' ? 'Professional sheet mask' : 'Professional skincare product'}</Text>
        <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 30ml</Text>
        <Text style={styles.detailItem}><Text style={styles.detailLabel}>Target:</Text> {product.category === 'Serum' ? 'Skin brightening and melanin control' : product.category === 'Cream' ? 'Anti-aging and skin nourishment' : product.category === 'Mask' ? 'Intensive skin repair and hydration' : 'Professional skincare treatment'}</Text>
        <Text style={styles.detailItem}><Text style={styles.detailLabel}>Technology:</Text> {product.category === 'Serum' ? 'MELAZERO® melanin care complex with multi-vitamin formula' : product.category === 'Cream' ? 'Advanced peptides with Korean skincare technology' : product.category === 'Mask' ? 'Hydrolyzed collagen with hyaluronic acid' : 'Korean skincare technology with proven ingredients'}</Text>
        <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> {product.category === 'Serum' ? 'Skin brightening, even skin tone, natural radiance, melanin control' : product.category === 'Cream' ? 'Anti-aging, skin firmness, hydration, wrinkle reduction' : product.category === 'Mask' ? 'Intensive hydration, skin firmness, elasticity, anti-aging' : 'Professional skincare results, skin health, premium quality'}</Text>
        <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> {product.category === 'Serum' ? 'Daily brightening treatment, morning and evening' : product.category === 'Cream' ? 'Daily anti-aging care, morning and evening' : product.category === 'Mask' ? '2-3 times per week for intensive treatment' : 'As directed for optimal results'}</Text>
        <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially {product.category === 'Serum' ? 'dull and uneven skin' : product.category === 'Cream' ? 'mature and aging skin' : product.category === 'Mask' ? 'dry and damaged skin' : 'all skin types'}</Text>
        <Text style={styles.detailItem}><Text style={styles.detailLabel}>Application:</Text> {product.category === 'Serum' ? 'Apply to clean skin before moisturizer' : product.category === 'Cream' ? 'Apply to clean skin as final step' : product.category === 'Mask' ? 'Apply to clean skin, leave for 15-20 minutes' : 'Apply to clean skin as directed'}</Text>
        <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
      </>
    );
  };

  useEffect(() => {
    const { productId } = route.params as { productId: string };
    console.log('Product ID from route:', productId);
    console.log('All products in service:', productService.getAllProducts().length);
    console.log('Product 11:', productService.getProductById('11'));
    if (productId) {
      const foundProduct = productService.getProductById(productId);
      console.log('Found product:', foundProduct);
      setProduct(foundProduct || null);
      if (foundProduct) {
        console.log('Product size options:', foundProduct.sizeOptions);
        console.log('Product name:', foundProduct.name);
        console.log('Size options length:', foundProduct.sizeOptions?.length);
        console.log('Size options array:', foundProduct.sizeOptions);
        setSelectedSize(foundProduct.defaultSize || (foundProduct.sizeOptions && foundProduct.sizeOptions[0]) || '');
      }
    }
    setLoading(false);
  }, [route.params]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      const sizeText = selectedSize ? ` (Size: ${selectedSize})` : '';
      Alert.alert(
        'Added to Cart',
        `${product.name}${sizeText} (${quantity} item${quantity > 1 ? 's' : ''}) has been added to your cart.`,
        [
          { text: 'Continue Shopping', style: 'cancel' },
          { text: 'View Cart', onPress: () => navigation.navigate('MainTabs', { screen: 'Cart' }) }
        ]
      );
    }
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading product details...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>Product not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color="#dc2626" />
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Special handling for INTENSIVE REPAIR COLLAGEN MASK
  const isCollagenMask = product.name.toLowerCase().includes('intensive repair collagen mask');

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollContainer}>

      {/* Product Name */}
      <View style={styles.productNameSection}>
        <Text style={styles.brand}>{product.brand}</Text>
        <Text style={styles.productName}>{product.name}</Text>
      </View>

      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.productImage}
          resizeMode="cover"
        />
        {product.isOnSale && (
          <View style={styles.saleBadge}>
            <Text style={styles.saleText}>SALE</Text>
          </View>
        )}
        {product.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newText}>NEW</Text>
          </View>
        )}
      </View>

      {/* Size Selection */}
      {(() => {
        console.log('Size selection check - product:', product?.name);
        console.log('Size selection check - sizeOptions:', product?.sizeOptions);
        console.log('Size selection check - length:', product?.sizeOptions?.length);
        return null;
      })()}
      {product.sizeOptions && product.sizeOptions.length > 0 && (
        <View style={styles.sizeSelectionContainer}>
          <Text style={[styles.sizeSelectionTitle, { color: theme.colors.text }]}>Size</Text>
          <View style={styles.sizeOptionsContainer}>
            {product.sizeOptions.map((size, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.sizeOption,
                  selectedSize === size && styles.sizeOptionSelected
                ]}
                onPress={() => setSelectedSize(size)}
              >
                <Text style={[
                  styles.sizeOptionText,
                  { color: theme.colors.text },
                  selectedSize === size && styles.sizeOptionTextSelected
                ]}>
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Stock Status */}
      <View style={styles.stockStatusContainer}>
        <View style={[styles.stockIndicator, { backgroundColor: product.inStock ? '#10b981' : '#ef4444' }]}>
          <Ionicons 
            name={product.inStock ? "checkmark-circle" : "close-circle"} 
            size={16} 
            color="#ffffff" 
          />
        </View>
        <Text style={[styles.stockStatusText, { color: theme.colors.text }]}>
          {product.inStock ? 'In Stock' : 'Out of Stock'}
        </Text>
      </View>

      {/* Product Category */}
      <TouchableOpacity 
        style={styles.stockStatusContainer}
        onPress={() => navigation.navigate('MainTabs', { screen: 'Products', params: { category: product.category } })}
      >
        <View style={[styles.stockIndicator, { backgroundColor: '#10b981' }]}>
          <Ionicons 
            name="checkmark-circle" 
            size={16} 
            color="#ffffff" 
          />
        </View>
        <Text style={[styles.stockStatusText, { color: theme.colors.text }]}>
          {product.category}
        </Text>
      </TouchableOpacity>

      {/* Reviews and Price */}
      <View style={styles.reviewsPriceSection}>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>⭐⭐⭐⭐ {product.averageRating.toFixed(1)}</Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>AED {getPriceForSize(product, selectedSize).toFixed(2)}</Text>
          <Text style={styles.vatText}>(VAT included)</Text>
          {product.originalPrice && product.originalPrice > product.price && (
            <Text style={styles.originalPrice}>AED {product.originalPrice.toFixed(2)}</Text>
          )}
        </View>
      </View>

      {/* Add to Cart Section */}
      <View style={styles.cartSection}>
        <Text style={styles.cartSectionTitle}>Add to Cart</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(-1)}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(1)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <Text style={styles.addToCartText}>AED {(getPriceForSize(product, selectedSize) * quantity).toFixed(2)}</Text>
        </TouchableOpacity>
      </View>

      {/* Product Info */}
      <View style={styles.content}>

        {/* Comprehensive Product Information for All Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Description</Text>
          <Text style={styles.description}>
            {isCollagenMask 
              ? "INTENSIVE REPAIR COLLAGEN MASK is a professional-grade sheet mask designed to restore skin firmness and elasticity. This innovative mask provides intensive repair and anti-aging benefits with hydrolyzed collagen and hyaluronic acid for comprehensive skin nourishment and hydration."
              : product.description || "Premium Korean dermacosmetics product designed for professional skincare results. This high-quality product combines advanced Korean skincare technology with proven ingredients to deliver exceptional results for all skin types."
            }
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Details</Text>
          <View style={styles.detailsList}>
            {getProductDetails(product)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          <View style={styles.featuresList}>
            {product.name === 'INTENSIVE HYDRO SOOTHING CREAM' ? (
              <>
                <Text style={styles.featureItem}>• Intensive Hydration - Advanced hydrating formula for long-lasting moisture</Text>
                <Text style={styles.featureItem}>• Soothing Properties - Calms skin irritation and provides relief for sensitive skin</Text>
                <Text style={styles.featureItem}>• Natural Ingredients - Aloe vera and snail secretion filtrate for gentle care</Text>
                <Text style={styles.featureItem}>• Professional & Home Use - Available in 50g and 250g sizes</Text>
              </>
            ) : (
              <>
                <Text style={styles.featureItem}>• Professional-Grade Quality</Text>
                <Text style={styles.featureItem}>• Dermatologically Tested</Text>
                <Text style={styles.featureItem}>• Korean Skincare Technology</Text>
                <Text style={styles.featureItem}>• Safe for All Skin Types</Text>
                <Text style={styles.featureItem}>• Clinically Proven Results</Text>
                <Text style={styles.featureItem}>• Premium Ingredients</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Benefits</Text>
          <View style={styles.benefitsList}>
            {product.name === 'INTENSIVE HYDRO SOOTHING CREAM' ? (
              <>
                <Text style={styles.benefitItem}>• Intensive Hydration - Provides long-lasting moisture for all skin types</Text>
                <Text style={styles.benefitItem}>• Skin Soothing - Calms irritation and reduces redness and inflammation</Text>
                <Text style={styles.benefitItem}>• Skin Repair - Promotes natural healing and skin regeneration</Text>
                <Text style={styles.benefitItem}>• Barrier Protection - Strengthens skin's natural protective barrier</Text>
                <Text style={styles.benefitItem}>• Gentle Care - Suitable for sensitive and irritated skin</Text>
                <Text style={styles.benefitItem}>• Versatile Use - Perfect for both professional treatments and daily home care</Text>
              </>
            ) : isCollagenMask ? (
              <>
                <Text style={styles.benefitItem}>• Intensive Hydration - Provides deep moisture for soft, supple skin</Text>
                <Text style={styles.benefitItem}>• Enhanced Elasticity - Boosts collagen production for improved skin firmness</Text>
                <Text style={styles.benefitItem}>• Reduces Fine Lines - Diminishes appearance of wrinkles for youthful complexion</Text>
                <Text style={styles.benefitItem}>• Skin Brightening - Enhances radiance and evens skin tone</Text>
                <Text style={styles.benefitItem}>• Deep Nourishment - Delivers essential nutrients for skin health</Text>
                <Text style={styles.benefitItem}>• Anti-Aging Properties - Combats signs of aging for younger-looking skin</Text>
              </>
            ) : (
              <>
                <Text style={styles.benefitItem}>• Advanced Skincare Technology - Utilizes cutting-edge Korean skincare innovations</Text>
                <Text style={styles.benefitItem}>• Professional Results - Delivers salon-quality results at home</Text>
                <Text style={styles.benefitItem}>• Skin Health Improvement - Promotes overall skin health and vitality</Text>
                <Text style={styles.benefitItem}>• Premium Ingredients - Contains high-quality, carefully selected ingredients</Text>
                <Text style={styles.benefitItem}>• Dermatologist Recommended - Trusted by skincare professionals worldwide</Text>
                <Text style={styles.benefitItem}>• Long-lasting Effects - Provides sustained benefits for improved skin appearance</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Ingredients</Text>
          <View style={styles.ingredientsList}>
            {isCollagenMask ? (
              <>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Hydrolyzed Collagen:</Text> Protein that supports skin structure and improves firmness.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Hyaluronic Acid:</Text> Powerful humectant that attracts and retains moisture.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Vitamin E:</Text> Antioxidant that protects skin from environmental damage.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Seaweed Extract:</Text> Rich in minerals and vitamins for skin nourishment.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Argan Oil:</Text> Moisturizes and softens skin with essential fatty acids.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Shea Butter:</Text> Natural emollient that soothes and hydrates skin.</Text>
              </>
            ) : (
              <>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Advanced Peptides:</Text> Stimulate collagen production for firmer, younger-looking skin.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Hyaluronic Acid:</Text> Provides intense hydration and plumps skin for a youthful appearance.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Vitamin C:</Text> Powerful antioxidant that brightens skin and reduces signs of aging.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Niacinamide:</Text> Improves skin texture and reduces the appearance of pores.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Ceramides:</Text> Strengthen skin barrier and lock in moisture.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Plant Extracts:</Text> Natural botanicals that soothe and nourish the skin.</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to Use</Text>
          <View style={styles.usageList}>
            {isCollagenMask ? (
              <>
                <Text style={styles.usageItem}>1. <Text style={styles.usageLabel}>Preparation:</Text> Cleanse skin thoroughly and apply toner if desired</Text>
                <Text style={styles.usageItem}>2. <Text style={styles.usageLabel}>Application:</Text> Remove mask from package and unfold carefully</Text>
                <Text style={styles.usageItem}>3. <Text style={styles.usageLabel}>Placement:</Text> Apply mask to face, adjusting for proper fit</Text>
                <Text style={styles.usageItem}>4. <Text style={styles.usageLabel}>Duration:</Text> Leave on for 15-20 minutes for optimal results</Text>
                <Text style={styles.usageItem}>5. <Text style={styles.usageLabel}>Removal:</Text> Gently remove mask and massage remaining essence into skin</Text>
                <Text style={styles.usageItem}>6. <Text style={styles.usageLabel}>Frequency:</Text> Use 2-3 times per week for best results</Text>
              </>
            ) : (
              <>
                <Text style={styles.usageItem}>1. <Text style={styles.usageLabel}>Preparation:</Text> Cleanse your skin thoroughly with a gentle cleanser</Text>
                <Text style={styles.usageItem}>2. <Text style={styles.usageLabel}>Application:</Text> Apply a small amount to clean, dry skin</Text>
                <Text style={styles.usageItem}>3. <Text style={styles.usageLabel}>Massage:</Text> Gently massage into skin using upward circular motions</Text>
                <Text style={styles.usageItem}>4. <Text style={styles.usageLabel}>Absorption:</Text> Allow product to fully absorb into the skin</Text>
                <Text style={styles.usageItem}>5. <Text style={styles.usageLabel}>Follow-up:</Text> Apply your regular moisturizer and sunscreen</Text>
                <Text style={styles.usageItem}>6. <Text style={styles.usageLabel}>Frequency:</Text> Use daily for best results, morning and/or evening</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.noteText}>
            <Text style={styles.noteLabel}>Note:</Text> This product is dermatologically tested and clinically proven for professional skincare results. For best results, use consistently as part of your daily skincare routine. Store in a cool, dry place away from direct sunlight. If irritation occurs, discontinue use and consult a dermatologist.
          </Text>
        </View>
      </View>

      {/* Shipping Info */}
        <View style={styles.shippingInfo}>
          <Text style={styles.shippingTitle}>Shipping Information</Text>
          <Text style={styles.shippingItem}>🚚 Free Shipping on orders over 1,000 AED</Text>
          <Text style={styles.shippingItem}>💳 Secure Payment with Stripe checkout</Text>
          <Text style={styles.shippingItem}>🏛️ 5% UAE Tax Payer - Supporting local economy</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollContainer: {
    flex: 1,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#dc2626',
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: '#ffffff',
  },
  productImage: {
    width: width,
    height: width * 0.8,
    backgroundColor: '#f3f4f6',
  },
  saleBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  saleText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  newBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  newText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  productNameSection: {
    padding: 20,
    paddingBottom: 10,
  },
  reviewsPriceSection: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  brand: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    lineHeight: 32,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rating: {
    fontSize: 16,
    color: '#f59e0b',
    fontWeight: '600',
    marginRight: 8,
  },
  reviewCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  priceContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#dc2626',
    marginRight: 12,
  },
  vatText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 2,
  },
  originalPrice: {
    fontSize: 18,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  detailsList: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  detailItem: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 20,
  },
  detailLabel: {
    fontWeight: '600',
    color: '#1f2937',
  },
  featuresList: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  featureItem: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 20,
  },
  benefitsList: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  benefitItem: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 20,
  },
  ingredientsList: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ingredientItem: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 20,
  },
  ingredientLabel: {
    fontWeight: '600',
    color: '#1f2937',
  },
  usageList: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  usageItem: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 20,
  },
  usageLabel: {
    fontWeight: '600',
    color: '#1f2937',
  },
  noteText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    fontStyle: 'italic',
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  noteLabel: {
    fontWeight: '600',
    color: '#92400e',
  },
  stockStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginHorizontal: 20,
    marginVertical: 8,
  },
  stockIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  stockStatusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  cartSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    alignItems: 'center',
  },
  cartSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: 'center',
  },
  addToCartButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addToCartText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  shippingInfo: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  shippingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  shippingItem: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 6,
    lineHeight: 20,
  },
  sizeSelectionContainer: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  sizeSelectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1f2937',
  },
  sizeOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sizeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  sizeOptionSelected: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  sizeOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  sizeOptionTextSelected: {
    color: '#ffffff',
  },
});
