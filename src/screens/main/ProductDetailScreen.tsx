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
  Linking,
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
      if (size === '50g') return 290.00;  // Homecare size - Same pricing as other creams
      if (size === '250g') return 420.00;  // Professional size - Same pricing as other creams
    }
    
    // MULTI FUNCTIONAL ANTI-WRINKLE SERUM
    if (name.includes('multi functional anti-wrinkle serum')) {
      return 330.00;  // Fixed price for 30ml only
    }
    
    // MULTI SUN CREAM
    if (name.includes('multi sun cream')) {
      return 210.00;  // Fixed price for 40g only
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
    
    // INTENSIVE PROBLEM CONTROL TONER
    if (name.includes('intensive problem control toner')) {
      if (size === '200ml') return 260.00;  // Homecare size - Current price
      if (size === '500ml') return 490.00;  // Professional size - Updated price
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
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Form:</Text> Multi-functional anti-wrinkle cream</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 50g (Homecare) / 250g (Professional)</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Target:</Text> Anti-aging and wrinkle reduction</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Technology:</Text> Advanced anti-aging formula with multi-functional benefits</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Wrinkle reduction, firming, collagen synthesis, antioxidant protection</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Morning and/or evening application</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially mature skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Formulation:</Text> Advanced anti-aging cream with multi-functional benefits</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // MULTI FUNCTIONAL ANTI-WRINKLE SERUM
    if (name.includes('multi functional anti-wrinkle serum')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Multi-functional anti-wrinkle serum</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 30ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Wrinkle reduction, skin firmness, anti-aging</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially aging and mature skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily anti-aging treatment</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Clinical Testing:</Text> Clinically tested for efficacy and safety</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // MULTI SUN CREAM
    if (name.includes('multi sun cream')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Daily sunscreen with SPF 40 PA++</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 40g</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Protection:</Text> UVA/UVB protection, SPF 40, PA++</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, including sensitive skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily sun protection, outdoor activities</Text>
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
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Form:</Text> Premium hair and scalp solution</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 5ml*8pcs</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Target:</Text> Hair loss prevention and regrowth</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Technology:</Text> Advanced peptide and botanical extract technology</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Hair loss prevention, regrowth stimulation, scalp health</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Professional and home care</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>System:</Text> Part of HR³ MATRIX MESOPECIA KIT</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // HR³ MATRIX HAIR TONIC α
    if (name.includes('hr³ matrix hair tonic') || name.includes('hair tonic')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Form:</Text> Premium hair and scalp tonic</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 70ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Target:</Text> Hair health and scalp revitalization</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Technology:</Text> Advanced peptide and botanical extract technology</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Hair strengthening, scalp health, circulation improvement</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Professional and home care</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>System:</Text> Part of HR³ MATRIX MESOPECIA KIT</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // HR³ MATRIX SCALP PEELING α
    if (name.includes('hr³ matrix scalp peeling') || name.includes('scalp peeling')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Form:</Text> Scalp peeling solution</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 100ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Target:</Text> Scalp preparation for microneedling treatments</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Technology:</Text> Gentle exfoliating and refreshing formula</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Scalp cleansing, refreshing sensation, treatment preparation</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Professional and home care</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // HR³ MATRIX SCALP SHAMPOO α
    if (name.includes('hr³ matrix scalp shampoo') || name.includes('scalp shampoo')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Form:</Text> Functional scalp shampoo</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 300ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Target:</Text> Hair loss prevention and scalp health</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Technology:</Text> Patented ingredient complex with KFDA approval</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Hair loss prevention, scalp cooling, sebum control</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Professional and home care</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Approval:</Text> KFDA approved functional product</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // HairGen BOOSTER
    if (name.includes('hairgen booster')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Auto-microneedling LED device for scalp treatment</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 1 Device</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Technology:</Text> Microneedling + LED light therapy</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Components:</Text> HR³ MATRIX HAIR SOLUTION α + HR³ MATRIX HAIR STAMP</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Benefits:</Text> Hair growth stimulation, scalp health improvement, nutrient delivery</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Professional and home care</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // Hair-GENTRON
    if (name.includes('hair-gentron')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> LED helmet with massaging and heating functions</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 1 Device</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Patent:</Text> No. 10-2151442 (Korea)</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Award:</Text> Bronze medal winner of 2020 Korea invention patent competition</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Light Types:</Text> Infrared + Red + Blue LED combination</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Features:</Text> Massaging, heating, music mode</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Professional and home care</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // INTENSIVE PROBLEM CONTROL CREAM
    if (name.includes('intensive problem control cream')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Form:</Text> Specialized problem control cream</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 50g (Homecare) 250g (Professional)</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Target:</Text> Problematic and acne-prone skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Technology:</Text> Advanced anti-microbial and anti-inflammatory formula</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Sebum control, anti-microbial, anti-inflammatory, soothing relief</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Morning and evening skincare routine</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially problematic and acne-prone skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // INTENSIVE PROBLEM CONTROL TONER
    if (name.includes('intensive problem control toner')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Form:</Text> Intensive problem control toner</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 200ml (Homecare) / 500ml (Professional)</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Target:</Text> Acne-prone, sensitive, and problematic skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Technology:</Text> Advanced active ingredient complex</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Problem control, pore minimizing, skin soothing</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Professional and home care</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> Problematic, acne-prone, sensitive skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // INTENSIVE BLEMISH BALM CREAM
    if (name.includes('intensive blemish balm cream')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Natural coverage cream with SPF protection</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 50g</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>SPF Rating:</Text> SPF 30 PA++</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Coverage:</Text> Natural to medium coverage</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Blemish coverage, sun protection, post-treatment care</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially sensitive and post-treatment skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // SKIN RESCUE OVERNIGHT CREAM MASK
    if (name.includes('skin rescue overnight cream mask')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Form:</Text> Overnight cream mask</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 100g</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Target:</Text> Fatigued and stressed skin recovery</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Technology:</Text> Dual formula with oxygen capsules and pink ceramide complex</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Skin revitalization, oxygen therapy, overnight recovery, erythema improvement</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Overnight treatment 2-3 times per week</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially fatigued skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Application:</Text> Apply generously, massage until capsules burst, leave overnight</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Results:</Text> Clinically proven to improve erythema and transepidermal water loss</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // MOISTURE REPLENISHING HYALURON CREAM
    if (name.includes('moisture replenishing hyaluron cream')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Advanced moisturizing cream</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 50g (Homecare) / 250g (Professional)</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Deep hydration, 72-hour persistence, skin barrier protection</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially dry and dehydrated skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily morning and evening application</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Technology:</Text> 4-step hydration system with multi-molecular hyaluronic acid</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // MOISTURE REPLENISHING HYALURON SERUM
    if (name.includes('moisture replenishing hyaluron serum')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Form:</Text> Hydrating serum with coconut water base</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 30ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Target:</Text> Deep hydration and moisture replenishment</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Technology:</Text> 4-step hydration system with multi-molecular hyaluronic acid</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Deep hydration, moisture retention, anti-inflammatory protection</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily morning and evening application</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially dry and dehydrated skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // HYDRO COOL MODELING MASK
    if (name.includes('hydro cool modeling mask')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Form:</Text> Professional modeling mask</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 1kg</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Target:</Text> Post-treatment skin soothing and hydration</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Technology:</Text> Advanced cooling and hydrating formula</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Cooling effect, hydration, pore minimizing, skin soothing</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Professional and home care</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // EyeCell EYE CONTOUR SERUM
    if (name.includes('eyecell eye contour serum')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Form:</Text> Eye contour serum</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 10ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially mature and aging skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Technology:</Text> Advanced peptide and botanical callus culture technology</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Wrinkle reduction, dark circle diminishment, puffiness relief</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Morning and evening</Text>
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
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Form:</Text> Oxygen bubbling mask cream</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 50g</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially damaged and stressed skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Technology:</Text> EGF and oxygen therapy</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Skin regeneration, oxygen therapy, anti-inflammatory</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Morning and evening</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Special Feature:</Text> Unique oxygen bubbling effect</Text>
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
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Form:</Text> Eye contour cream</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 20g</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially mature and aging skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Technology:</Text> Advanced peptide and botanical callus culture technology</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Wrinkle reduction, dark circle diminishment, puffiness relief</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Morning and evening</Text>
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
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Form:</Text> Professional carboxy therapy kit (Gel + Sheet Mask)</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 1 kit</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially dull and stressed skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Technology:</Text> CO₂ therapy with Bohr Effect mechanism</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Oxygen therapy, skin firming, brightening, anti-blemish</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> 1-2 times per week</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Kit Contents:</Text> Gel 20g x 5ea, Mask 12g x 5ea, 1 Peptide Mask</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Special Feature:</Text> Catalytic mask for enhanced treatment absorption</Text>
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
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Form:</Text> Thermo-sensitive hydrogel patches</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 101g (60 patches)</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially mature and aging skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Technology:</Text> Patented thermo-sensitive hydrogel technology</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Puffiness reduction, dark circle lightening, fine line smoothing</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> 20-40 minutes per application</Text>
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
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Form:</Text> Powder mask (activates with water)</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 300g</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially mature and aging skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Technology:</Text> Bio-fermentation process</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Age defying, skin renewal, deep hydration</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> 1-2 times per week</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // SKIN REBOOT PDRN MASK PACK
    if (name.includes('skin reboot pdrn mask pack')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Professional-grade PDRN mask pack</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 30 sheets per container</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Skin regeneration, barrier repair, anti-aging</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially damaged or aging skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> 2-3 times per week or as needed for intensive care</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Technology:</Text> PDRN (salmon DNA) extraction technology</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // EyeCell EYE ZONE CARE KIT
    if (name.includes('eyecell eye zone care kit')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Form:</Text> Professional eye care system</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 1 box</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types, especially mature and aging skin</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Technology:</Text> Micro-needling + advanced peptide technology</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Wrinkle reduction, dark circle diminishment, puffiness relief</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Professional and home care</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Kit Contents:</Text> 4 components (serum, cream, patches, eye roller)</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // GENO-LED IR II
    if (name.includes('geno-led ir ii')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Light Wavelengths:</Text> Red light (630-660nm) and Infrared (800-1000nm)</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Treatment Time:</Text> 10-20 minutes per session</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Frequency:</Text> 3-5 times per week for optimal results</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Safety:</Text> FDA-cleared for home use</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Power Source:</Text> Rechargeable battery with long-lasting performance</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Design:</Text> Ergonomic, portable, and easy to use</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Country of Origin:</Text> South Korea</Text>
        </>
      );
    }
    
    // HR³ MATRIX MESOPECIA KIT
    if (name.includes('hr³ matrix mesopecia kit') || name.includes('mesopecia kit')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Form:</Text> Professional hair and scalp treatment kit</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 1 Kit</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Target:</Text> Hair loss prevention and regrowth</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Technology:</Text> Advanced peptide and botanical extract technology</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Hair loss prevention, regrowth stimulation, scalp health</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Professional and home care</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Kit Contents:</Text> Scalp peeling, hair solution, roller device</Text>
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
    
    // MICROBIOME ENERGY INFUSING MIST
    if (name.includes('microbiome energy infusing mist')) {
      return (
        <>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Type:</Text> Microbiome energy infusing mist</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Size:</Text> 80ml</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Key Benefits:</Text> Microbiome balance, hydration, radiance, barrier protection</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Type:</Text> All skin types</Text>
          <Text style={styles.detailItem}><Text style={styles.detailLabel}>Usage:</Text> Daily skincare routine, on-the-go hydration</Text>
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
  console.log('Product name:', product?.name);
  console.log('Product name check:', product?.name === 'SKIN REBOOT PDRN MASK PACK');
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
        {product.name === 'EyeCell EYE CONTOUR SERUM' && (
          <View style={styles.inStockBadge}>
            <Text style={styles.inStockText}>IN STOCK</Text>
          </View>
        )}
        {product.name === 'EyeCell EYE PEPTIDE GEL PATCH' && (
          <View style={styles.inStockBadge}>
            <Text style={styles.inStockText}>IN STOCK</Text>
          </View>
        )}
        {product.name === 'EyeCell EYE ZONE CARE KIT' && (
          <View style={styles.inStockBadge}>
            <Text style={styles.inStockText}>IN STOCK</Text>
          </View>
        )}
        {product.name === 'GENO-LED IR II' && (
          <View style={styles.inStockBadge}>
            <Text style={styles.inStockText}>IN STOCK</Text>
          </View>
        )}
        {product.name === 'SKIN REBOOT PDRN MASK PACK' && (
          <View style={styles.inStockBadge}>
            <Text style={styles.inStockText}>IN STOCK</Text>
          </View>
        )}
        {product.name === 'INTENSIVE BLEMISH BALM CREAM [SPF 30 PA++]' && (
          <View style={styles.inStockBadge}>
            <Text style={styles.inStockText}>IN STOCK</Text>
          </View>
        )}
        {product.name === 'SKIN RESCUE OVERNIGHT CREAM MASK' && (
          <View style={styles.inStockBadge}>
            <Text style={styles.inStockText}>IN STOCK</Text>
          </View>
        )}
        {product.name === 'HR³ MATRIX MESOPECIA KIT' && (
          <View style={styles.inStockBadge}>
            <Text style={styles.inStockText}>IN STOCK</Text>
          </View>
        )}
        {product.name === 'HR³ MATRIX HAIR SOLUTION α' && (
          <View style={styles.inStockBadge}>
            <Text style={styles.inStockText}>IN STOCK</Text>
          </View>
        )}
        {product.name === 'HYDRO COOL MODELING MASK' && (
          <View style={styles.inStockBadge}>
            <Text style={styles.inStockText}>IN STOCK</Text>
          </View>
        )}
        {product.name === 'HR³ MATRIX HAIR TONIC α' && (
          <View style={styles.inStockBadge}>
            <Text style={styles.inStockText}>IN STOCK</Text>
          </View>
        )}
        {product.name === 'HR³ MATRIX SCALP PEELING α' && (
          <View style={styles.inStockBadge}>
            <Text style={styles.inStockText}>IN STOCK</Text>
          </View>
        )}
        {product.name === 'HR³ MATRIX SCALP SHAMPOO α' && (
          <View style={styles.inStockBadge}>
            <Text style={styles.inStockText}>IN STOCK</Text>
          </View>
        )}
        {product.name === 'Hair-GENTRON' && (
          <View style={styles.inStockBadge}>
            <Text style={styles.inStockText}>IN STOCK</Text>
          </View>
        )}
        {product.name === 'HairGen BOOSTER' && (
          <View style={styles.inStockBadge}>
            <Text style={styles.inStockText}>IN STOCK</Text>
          </View>
        )}
        {product.name === 'INTENSIVE HYDRO SOOTHING CREAM' && (
          <View style={styles.inStockBadge}>
            <Text style={styles.inStockText}>IN STOCK</Text>
          </View>
        )}
        {product.name === 'INTENSIVE PROBLEM CONTROL TONER' && (
          <View style={styles.inStockBadge}>
            <Text style={styles.inStockText}>IN STOCK</Text>
          </View>
        )}
        {product.name === 'MICROBIOME ENERGY INFUSING MIST' && (
          <View style={styles.inStockBadge}>
            <Text style={styles.inStockText}>IN STOCK</Text>
          </View>
        )}
        {product.name === 'MOISTURE REPLENISHING HYALURON SERUM' && (
          <View style={styles.inStockBadge}>
            <Text style={styles.inStockText}>IN STOCK</Text>
          </View>
        )}
        {product.name === 'INTENSIVE PROBLEM CONTROL CREAM' && (
          <View style={styles.inStockBadge}>
            <Text style={styles.inStockText}>IN STOCK</Text>
          </View>
        )}
        {product.name === 'MULTI FUNCTIONAL ANTI-WRINKLE CREAM' && (
          <View style={styles.inStockBadge}>
            <Text style={styles.inStockText}>IN STOCK</Text>
          </View>
        )}
        {product.name === 'MULTI FUNCTIONAL ANTI-WRINKLE SERUM' && (
          <View style={styles.inStockBadge}>
            <Text style={styles.inStockText}>IN STOCK</Text>
          </View>
        )}
        {product.name === 'MULTI SUN CREAM [SPF 40 PA++]' && (
          <View style={styles.inStockBadge}>
            <Text style={styles.inStockText}>IN STOCK</Text>
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

      {/* Product Size */}
      <View style={styles.stockStatusContainer}>
        <View style={[styles.stockIndicator, { backgroundColor: '#10b981' }]}>
          <Ionicons 
            name="checkmark-circle" 
            size={16} 
            color="#ffffff" 
          />
        </View>
        <Text style={[styles.stockStatusText, { color: theme.colors.text }]}>
          Size: {(() => {
            if (product.name === 'ALL FOR SENSITIVE SERUM') return '30ml';
            if (product.name === 'EyeCell EYE CONTOUR CREAM') return '20g';
            if (product.name === 'EyeCell EYE CONTOUR SERUM') return '10ml';
            if (product.name === 'EyeCell EYE PEPTIDE GEL PATCH') return '101g (60 patches)';
            if (product.name === 'EyeCell EYE ZONE CARE KIT') return '1 Kit';
            if (product.name === 'GENO-LED IR II') return '1 Device';
            if (product.name === 'SKIN REBOOT PDRN MASK PACK') return '30 sheets per container';
            if (product.name === 'BIO-FERMENT AGE DEFYING POWDER MASK') return '300g';
            if (product.name === 'EGF REPAIR OXYMASK CREAM') return '50g';
            if (product.name === 'EPI TURNOVER BOOSTING PEELING GEL') return '100g';
            if (product.name === 'EZ CO₂ MASK KIT') return '1 Kit';
            if (product.name === 'HYDRO COOL MODELING MASK') return '1kg';
            if (product.name === 'HR³ MATRIX HAIR TONIC α') return '70ml';
            if (product.name === 'HR³ MATRIX SCALP PEELING α') return '100ml';
            if (product.name === 'HR³ MATRIX SCALP SHAMPOO α') return '300ml';
            if (product.name === 'Hair-GENTRON') return '1 Device';
            if (product.name === 'HairGen BOOSTER') return '1 Device';
            if (product.name === 'INTENSIVE HYDRO SOOTHING CREAM') return '50g/250g';
            if (product.name === 'INTENSIVE PROBLEM CONTROL TONER') return '200ml/500ml';
            if (product.name === 'MICROBIOME ENERGY INFUSING MIST') return '80ml';
            if (product.name === 'MOISTURE REPLENISHING HYALURON CREAM') return '50g/250g';
            if (product.name === 'INTENSIVE PROBLEM CONTROL CREAM') return '50g/250g';
            if (product.name === 'MULTI FUNCTIONAL ANTI-WRINKLE CREAM') return '50g/250g';
            if (product.name === 'MULTI FUNCTIONAL ANTI-WRINKLE SERUM') return '30ml';
            if (product.name === 'MULTI SUN CREAM [SPF 40 PA++]') return '40g';
            if (product.name === 'MOISTURE REPLENISHING HYALURON SERUM') return '30ml';
            return '30ml';
          })()}
        </Text>
      </View>

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
          <View style={styles.descriptionBlock}>
          <Text style={styles.description}>
              {product.name === 'ALL FOR SENSITIVE SERUM' 
                ? "GENOSYS ALL FOR SENSITIVE SERUM is a specialized skin repairing serum designed specifically for sensitive skin. This advanced formula provides a protective moisture barrier while delivering anti-inflammatory and soothing properties to calm and repair sensitized skin. Perfect for those with reactive, easily irritated skin."
                : product.name === 'EyeCell EYE CONTOUR CREAM'
                ? "GENOSYS EyeCell EYE CONTOUR CREAM is a daily eye care product specifically designed to address multiple concerns around the delicate eye area. This advanced eye cream targets fine wrinkles, crow's feet, dark circles, and under-eye puffiness while promoting microcirculation to enhance overall skin health and provide comprehensive eye area care."
                : product.name === 'EyeCell EYE CONTOUR SERUM'
                ? "GENOSYS EyeCell EYE CONTOUR SERUM is a highly enriched all-in-one eye serum specifically designed to address multiple concerns around the delicate eye area. This advanced serum targets fine wrinkles, dark circles, and under-eye puffiness while promoting skin regeneration and providing comprehensive eye area care with its powerful peptide complex and botanical callus culture extracts."
                : product.name === 'EyeCell EYE PEPTIDE GEL PATCH'
                ? "GENOSYS EyeCell EYE PEPTIDE GEL PATCH is a specialized treatment designed to rejuvenate and care for the delicate skin around the eyes. These crescent-shaped gel patches are infused with a potent blend of peptides, botanical extracts, and other active ingredients to address common eye area concerns including puffiness, dark circles, fine lines, and signs of fatigue."
                : product.name === 'EyeCell EYE ZONE CARE KIT'
                ? "GENOSYS EyeCell EYE ZONE CARE KIT is a comprehensive professional-grade solution designed to address various concerns in the delicate eye area, including fine lines, dark circles, puffiness, and crow's feet. This advanced kit combines cosmeceuticals with a specialized micro-needle roller to enhance the absorption of active ingredients and stimulate collagen production for comprehensive eye rejuvenation."
                : product.name === 'GENO-LED IR II'
                ? "GENOSYS GENO-LED IR II is an advanced LED therapy device that combines infrared and red light technology to provide professional-grade skin rejuvenation treatments. This innovative device utilizes specific wavelengths of light to stimulate cellular activity, promote collagen production, and enhance overall skin health for both professional and home use."
                : product.name === 'SKIN REBOOT PDRN MASK PACK'
                ? "SKIN REBOOT PDRN MASK PACK is a professional-grade treatment mask infused with PDRN (Polydeoxyribonucleotide) extracted from salmon DNA. This advanced mask promotes cellular regeneration, accelerates skin repair, and enhances overall skin health. Perfect for post-treatment care and intensive skin rejuvenation."
                : product.name === 'HR³ MATRIX HAIR SOLUTION α'
                ? "GENOSYS HR³ MATRIX HAIR SOLUTION α is a premium scalp and hair care treatment specifically formulated to combat hair loss and promote healthy hair regrowth. This advanced solution addresses the fundamental causes of hair loss by accelerating angiogenesis, inhibiting hair loss substances, and providing essential nutrients to hair follicles for optimal growth and strength."
                : product.name === 'BIO-FERMENT AGE DEFYING POWDER MASK'
                ? "GENOSYS BIO-FERMENT AGE DEFYING POWDER MASK is an innovative fermented powder mask that combines traditional fermentation technology with modern skincare science. This unique powder-to-mask formula activates upon mixing with water, creating a powerful treatment that delivers concentrated nutrients and beneficial compounds directly to the skin for maximum anti-aging benefits."
                : product.name === 'EGF REPAIR OXYMASK CREAM'
                ? "GENOSYS EGF REPAIR OXYMASK CREAM is a unique oxygen bubbling mask cream designed to rejuvenate dull and stressed skin. This innovative 'S.O.S' cream effectively addresses skin damage from various causes, providing immediate relief and long-term skin regeneration through advanced oxygen therapy and skin-regenerating ingredients."
                : product.name === 'EPI TURNOVER BOOSTING PEELING GEL'
                ? "GENOSYS EPI TURNOVER BOOSTING PEELING GEL is an enzyme-based exfoliating gel designed to gently remove dead skin cells without causing irritation. This innovative peeling gel utilizes natural enzymes and plant extracts to purify, nourish, and moisturize the skin, making it suitable for all skin types while promoting a smoother, more radiant complexion."
                : product.name === 'EZ CO₂ MASK KIT'
                ? "GENOSYS EZ CO₂ MASK KIT is a professional carboxy therapy system designed to deliver oxygen to the skin through the innovative 'Bohr Effect' mechanism. This advanced CO₂ therapy kit combines a specialized gel and sheet mask to accelerate oxygen delivery to skin tissues, providing firming, brightening, and anti-blemish effects while preparing the skin for optimal absorption of active ingredients."
                : product.name === 'MULTI FUNCTIONAL ANTI-WRINKLE SERUM'
                ? "MULTI FUNCTIONAL ANTI-WRINKLE SERUM is an advanced anti-aging serum that combines the power of bakuchiol, a natural alternative to retinol, with cutting-edge peptide technology. This clinically-tested formula helps visibly smooth wrinkles, reinforce skin firmness, and restore youthful radiance for all skin types."
                : product.name === 'MULTI SUN CREAM [SPF 40 PA++]'
                ? "MULTI SUN CREAM [SPF 40 PA++] is an advanced daily sunscreen designed to provide comprehensive UV protection while maintaining a natural, glowing complexion. This innovative formula combines high-level sun protection with skin-nourishing ingredients to protect against both UVA and UVB rays while promoting healthy, radiant skin."
                : isCollagenMask 
              ? "INTENSIVE REPAIR COLLAGEN MASK is a professional-grade sheet mask designed to restore skin firmness and elasticity. This innovative mask provides intensive repair and anti-aging benefits with hydrolyzed collagen and hyaluronic acid for comprehensive skin nourishment and hydration."
              : product.description || "Premium Korean dermacosmetics product designed for professional skincare results. This high-quality product combines advanced Korean skincare technology with proven ingredients to deliver exceptional results for all skin types."
            }
          </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Details</Text>
          <View style={styles.detailsList}>
            {getProductDetails(product)}
          </View>
        </View>

        {/* Key Features Section for SKIN REBOOT PDRN MASK PACK */}
        {product.name === 'SKIN REBOOT PDRN MASK PACK' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
            <View style={styles.detailsList}>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>PDRN Technology:</Text> Contains PDRN extracted from salmon DNA to promote cellular regeneration and accelerate skin healing and repair processes.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Ultra-Slim Fit Sheet:</Text> Ultra-slim fit sheet adheres seamlessly to the skin for effective delivery of active ingredients and maximum absorption.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Convenient Packaging:</Text> Contains 30 sheets per container with tissue-style packaging that allows for convenient one-by-one dispensing with built-in tweezers.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Barrier Restoration:</Text> Clinical results show significant improvement in restoring the skin barrier damaged by physical irritation or environmental stress.</Text>
            </View>
        </View>
        )}

        {/* Key Features Section for SKIN RESCUE OVERNIGHT CREAM MASK */}
        {product.name === 'SKIN RESCUE OVERNIGHT CREAM MASK' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
            <View style={styles.detailsList}>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Dual Formula Technology:</Text> Combines oxygen capsules with pink ceramide complex for comprehensive skin recovery and protection.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Overnight Treatment:</Text> Specifically designed for overnight use to maximize skin recovery while you sleep.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Oxygen Therapy:</Text> Italian oxygenated water capsules that burst on contact, delivering instant oxygen therapy for skin renewal.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Growth Factor Complex:</Text> Contains EGF, aFGF, bFGF, PIGF, IGF growth factors that work together to promote skin renewal and healing.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Clinical Results:</Text> Clinically proven to improve erythema and transepidermal water loss for healthier, more resilient skin.</Text>
          </View>
        </View>
        )}

        {/* Key Features Section for HR³ MATRIX HAIR SOLUTION α */}
        {product.name === 'HR³ MATRIX HAIR SOLUTION α' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
            <View style={styles.detailsList}>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Advanced Peptide Technology:</Text> Features Sh-polypeptide-71, Copper Tripeptide-1, and Pentapeptide-20 for targeted hair follicle support and growth stimulation.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Botanical Extracts:</Text> Rich blend of traditional herbs including Sophora Japonica, Portulaca Oleracea, and Polygonum Multiflorum for natural scalp nourishment.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Scalp Circulation Enhancement:</Text> Niacinamide and botanical extracts work together to improve blood circulation and nutrient delivery to hair follicles.</Text>
          </View>
        </View>
        )}

        {/* Kit Components Section for HR³ MATRIX MESOPECIA KIT */}
        {product.name === 'HR³ MATRIX MESOPECIA KIT' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kit Components</Text>
            <View style={styles.detailsList}>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>HR³ MATRIX SCALP PEELING (100ml):</Text> Deep-cleansing solution that removes keratin, sebum, and impurities while providing a refreshing cooling effect for optimal scalp preparation.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>HR³ MATRIX HAIR SOLUTION (5ml x 6 vials):</Text> Premium scalp and hair care product that combats factors causing hair loss, accelerates angiogenesis, and inhibits substances responsible for hair thinning.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>GENOSYS STAMP (ROLLER):</Text> Specialized device designed to enhance absorption of active ingredients into the scalp, optimizing treatment effectiveness and ensuring deeper penetration.</Text>
            </View>
        </View>
        )}

        {/* Key Features Section for HR³ MATRIX HAIR TONIC α */}
        {product.name === 'HR³ MATRIX HAIR TONIC α' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
            <View style={styles.detailsList}>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Peptide Technology:</Text> Advanced peptide complex including Sh-polypeptide-71 and Copper Tripeptide-1 for targeted hair follicle nourishment and growth stimulation.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Botanical Extracts:</Text> Rich blend of traditional herbs and plant extracts including Sophora Japonica, Portulaca Oleracea, and Polygonum Multiflorum for natural scalp nourishment.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Scalp Revitalization:</Text> Niacinamide and botanical extracts work synergistically to improve scalp circulation and provide essential nutrients to hair follicles.</Text>
          </View>
        </View>
        )}

        {/* Key Features Section for MULTI FUNCTIONAL ANTI-WRINKLE SERUM */}
        {product.name === 'MULTI FUNCTIONAL ANTI-WRINKLE SERUM' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
            <View style={styles.detailsList}>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Natural Retinol Alternative:</Text> Features bakuchiol, a plant-derived alternative to retinol that provides anti-aging benefits without irritation.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Advanced Peptide Complex:</Text> Contains Anti-aging Peptide 6 and other peptides that target specific signs of aging for comprehensive results.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Lipid Barrier Technology:</Text> Innovative liposome delivery system with ceramides, cholesterol, and phytosphingosine for enhanced penetration.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Clinical Validation:</Text> Clinically tested with proven results in improving skin age index and overall skin quality.</Text>
          </View>
        </View>
        )}

        {/* Key Features Section for MULTI SUN CREAM */}
        {product.name === 'MULTI SUN CREAM [SPF 40 PA++]' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
            <View style={styles.detailsList}>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>High SPF Protection:</Text> SPF 40 PA++ provides strong protection against both UVA and UVB rays for comprehensive sun defense.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Non-Greasy Formula:</Text> Lightweight, non-greasy texture that absorbs quickly without leaving a white cast or sticky residue.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Skin Glowing Effect:</Text> Advanced formula that enhances natural skin radiance while providing sun protection.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Daily Use Formula:</Text> Gentle enough for daily use while providing robust protection for all skin types.</Text>
          </View>
        </View>
        )}

        {product.name === 'Hair-GENTRON' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
            <View style={styles.detailsList}>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Multi-LED Light Therapy:</Text> Infrared light + Red light + Blue light combination for comprehensive scalp treatment and hair follicle stimulation.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Massaging Function:</Text> Air pressure massaging system that can be used simultaneously with light therapy for enhanced treatment effectiveness.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Heating Function:</Text> Optional heating feature that can be added during treatment to improve blood circulation and enhance light penetration.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Music Mode:</Text> Built-in relaxation features to help users feel comfortable and relaxed during treatment sessions.</Text>
          </View>
        </View>
        )}
        {product.name === 'Hair-GENTRON' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
            <View style={styles.detailsList}>
              <Text style={styles.detailItem}>1. <Text style={styles.detailLabel}>Light Therapy:</Text> Infrared, red, and blue LED lights stimulate hair follicles and improve scalp health</Text>
              <Text style={styles.detailItem}>2. <Text style={styles.detailLabel}>Massaging:</Text> Air pressure massaging improves blood circulation and enhances treatment effectiveness</Text>
              <Text style={styles.detailItem}>3. <Text style={styles.detailLabel}>Heating:</Text> Optional heating function increases blood flow and light penetration</Text>
              <Text style={styles.detailItem}>4. <Text style={styles.detailLabel}>Relaxation:</Text> Music mode and comfortable design ensure a pleasant treatment experience</Text>
          </View>
        </View>
        )}
        {product.name === 'HairGen BOOSTER' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
            <View style={styles.detailsList}>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Auto-Microneedling Technology:</Text> Automated microneedling system that creates micro-channels in the scalp to enhance nutrient absorption and stimulate natural healing processes.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>LED Light Therapy:</Text> Advanced LED light system that stimulates hair follicles, improves scalp circulation, and promotes cellular regeneration for enhanced hair growth.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>HR³ MATRIX HAIR SOLUTION α:</Text> Premium anti-hair loss solution that supplies essential nutrients to combat factors causing hair loss and promote healthy hair growth.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>HR³ MATRIX HAIR STAMP:</Text> Patented delivery enhancer with microneedles that leads to scalp regeneration and collagen production through natural wound healing processes.</Text>
          </View>
        </View>
        )}

        {/* Key Features Section for INTENSIVE BLEMISH BALM CREAM [SPF 30 PA++] */}
        {product.name === 'INTENSIVE BLEMISH BALM CREAM [SPF 30 PA++]' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
            <View style={styles.detailsList}>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Natural Coverage Technology:</Text> Advanced formula that provides natural-looking coverage while allowing your skin's natural tone to shine through.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>SPF 30 PA++ Protection:</Text> Broad-spectrum sun protection that shields skin from harmful UV rays and environmental damage.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Blemish Coverage:</Text> Effectively covers redness, blemishes, and imperfections for a flawless, even complexion.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Post-Treatment Care:</Text> Ideal for covering redness and blemishes after dermatological treatments while promoting skin healing.</Text>
          </View>
        </View>
        )}

        {/* Key Features Section for INTENSIVE HYDRO SOOTHING CREAM */}
        {product.name === 'INTENSIVE HYDRO SOOTHING CREAM' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
            <View style={styles.detailsList}>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Intensive Hydration:</Text> Advanced hydrating formula that provides long-lasting moisture and helps maintain optimal skin hydration levels.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Soothing Properties:</Text> Calms down skin irritation and provides relief for sensitive, stressed, or damaged skin.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Natural Ingredients:</Text> Formulated with premium natural ingredients including aloe vera and snail secretion filtrate for gentle, effective care.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Professional & Home Use:</Text> Available in both homecare (50g) and professional (250g) sizes for versatile application.</Text>
          </View>
        </View>
        )}
        {product.name === 'HairGen BOOSTER' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
            <View style={styles.detailsList}>
              <Text style={styles.detailItem}>1. <Text style={styles.detailLabel}>Microneedling:</Text> Creates micro-channels in the scalp to enhance product absorption</Text>
              <Text style={styles.detailItem}>2. <Text style={styles.detailLabel}>LED Therapy:</Text> Light therapy stimulates hair follicles and improves scalp circulation</Text>
              <Text style={styles.detailItem}>3. <Text style={styles.detailLabel}>Nutrient Delivery:</Text> HR³ MATRIX HAIR SOLUTION α provides essential nutrients for hair growth</Text>
              <Text style={styles.detailItem}>4. <Text style={styles.detailLabel}>Regeneration:</Text> Natural wound healing process promotes collagen production and scalp health</Text>
          </View>
        </View>
        )}

        {/* Key Features Section for MICROBIOME ENERGY INFUSING MIST */}
        {product.name === 'MICROBIOME ENERGY INFUSING MIST' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
            <View style={styles.detailsList}>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Microbiome Technology:</Text> Advanced probiotic and prebiotic blend that corrects and maintains the natural balance of skin microbiome.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Instant Hydration:</Text> Powerful hyaluronic acid complex that provides immediate and long-lasting moisture to the skin.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Natural Radiance:</Text> Unique formula that revitalizes skin and enhances natural glow and radiance for a healthy complexion.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Barrier Protection:</Text> Strengthens skin's natural moisture barrier and enhances skin's natural defense mechanisms.</Text>
          </View>
        </View>
        )}

        {/* Key Features Section for MOISTURE REPLENISHING HYALURON CREAM */}
        {product.name === 'MOISTURE REPLENISHING HYALURON CREAM' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
            <View style={styles.detailsList}>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>4-Step Hydration System:</Text> Advanced multi-layered hydration that cools, attracts, replenishes, and locks in moisture for comprehensive skin hydration.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>72-Hour Hydration Persistence:</Text> Clinically proven to maintain skin hydration for up to 72 hours, providing long-lasting moisture benefits.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Hyaluronan 11 Multi-Complex:</Text> Advanced hyaluronic acid complex with multiple molecular weights for deep penetration and surface protection.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Mushroom Extract Complex:</Text> Powerful anti-inflammatory and antioxidant properties from various mushroom extracts for skin nourishment and protection.</Text>
          </View>
        </View>
        )}

        {/* Key Features Section for MOISTURE REPLENISHING HYALURON SERUM */}
        {product.name === 'MOISTURE REPLENISHING HYALURON SERUM' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
            <View style={styles.detailsList}>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>4-Step Hydration System:</Text> Advanced hydration technology that works in layers for comprehensive moisture delivery and retention.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Coconut Water Base:</Text> Natural coconut water provides electrolytes and natural hydration for optimal skin balance.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Hyaluronic Acid Complex:</Text> Multi-molecular weight hyaluronic acids for layer-by-layer moisture replenishment and barrier formation.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Mushroom Extracts:</Text> Powerful mushroom extracts provide anti-inflammatory and antioxidant protection for healthy skin.</Text>
          </View>
        </View>
        )}

        {/* 4-Step Hydration Process Section for MOISTURE REPLENISHING HYALURON SERUM */}
        {product.name === 'MOISTURE REPLENISHING HYALURON SERUM' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4-Step Hydration Process</Text>
            <View style={styles.detailsList}>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Step 1: Electrolyte Balance</Text> Coconut water electrolytes lead moisture into the skin and balance water content for optimal hydration.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Step 2: Aquaporin Stimulation</Text> Stimulates aquaporin formation to open water-transport channels and attract moisture to the skin.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Step 3: Multi-Layer Replenishment</Text> Low and middle molecular weight hyaluronic acids replenish moisture layer by layer from deep within the skin.</Text>
              <Text style={styles.detailItem}><Text style={styles.detailLabel}>Step 4: Barrier Formation</Text> High molecular weight hyaluronic acid prevents moisture evaporation by forming a protective barrier on the skin surface.</Text>
          </View>
        </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Benefits</Text>
          <View style={styles.benefitsList}>
            {console.log('🔍 Benefits section - Product name:', product.name)}
            {product.name === 'ALL FOR SENSITIVE SERUM' ? (
              <>
                <Text style={styles.benefitItem}>• Skin Barrier Repair - Strengthens and rebuilds the skin's natural protective barrier</Text>
                <Text style={styles.benefitItem}>• Anti-Inflammatory - Reduces redness and calms irritated, sensitive skin</Text>
                <Text style={styles.benefitItem}>• Soothing Relief - Provides immediate comfort for sensitized skin</Text>
                <Text style={styles.benefitItem}>• Moisture Barrier - Creates a protective layer to prevent moisture loss</Text>
                <Text style={styles.benefitItem}>• Gentle Formula - Specifically designed for sensitive and reactive skin</Text>
                <Text style={styles.benefitItem}>• Skin Repair - Helps repair damaged skin and restore healthy function</Text>
              </>
            ) : product.name === 'EyeCell EYE CONTOUR CREAM' ? (
              <>
                <Text style={styles.benefitItem}>• Fine Wrinkle Reduction - Targets and reduces fine lines around the eye area</Text>
                <Text style={styles.benefitItem}>• Crow's Feet Diminishing - Helps diminish the appearance of crow's feet</Text>
                <Text style={styles.benefitItem}>• Dark Circle Lightening - Lightens dark circles and under-eye discoloration</Text>
                <Text style={styles.benefitItem}>• Puffiness Relief - Alleviates under-eye puffiness and swelling</Text>
                <Text style={styles.benefitItem}>• Microcirculation Enhancement - Promotes blood circulation for healthier skin</Text>
                <Text style={styles.benefitItem}>• Firming Effects - Provides firming and lifting benefits</Text>
                <Text style={styles.benefitItem}>• Daily Care - Suitable for daily use in morning and evening routines</Text>
              </>
            ) : product.name === 'EyeCell EYE CONTOUR SERUM' ? (
              <>
                <Text style={styles.benefitItem}>• Wrinkle Reduction - Stimulates collagen production and relaxes facial muscles for smoother skin</Text>
                <Text style={styles.benefitItem}>• Dark Circle Diminishment - Anti-dark circle complex strengthens skin and visibly reduces dark circles</Text>
                <Text style={styles.benefitItem}>• Puffiness Relief - Alleviates under-eye puffiness and swelling</Text>
                <Text style={styles.benefitItem}>• Hydration and Firmness - Deeply moisturizes and plumps skin, enhancing elasticity</Text>
                <Text style={styles.benefitItem}>• Antioxidant Protection - Botanical stem cell extracts provide soothing and whitening effects</Text>
                <Text style={styles.benefitItem}>• Skin Regeneration - Promotes cellular renewal and skin repair</Text>
                <Text style={styles.benefitItem}>• Professional Results - Delivers clinical-grade results for comprehensive eye care</Text>
              </>
            ) : product.name === 'EyeCell EYE PEPTIDE GEL PATCH' ? (
              <>
                <Text style={styles.benefitItem}>• Reduces Puffiness and Dark Circles - Effectively combats under-eye bags and dark circles for a refreshed appearance</Text>
                <Text style={styles.benefitItem}>• Smooths Fine Lines and Wrinkles - Peptide complex works to diminish the appearance of fine lines, promoting smoother skin</Text>
                <Text style={styles.benefitItem}>• Hydrates and Soothes - Deep hydration and soothing effect, reducing signs of fatigue and stress</Text>
                <Text style={styles.benefitItem}>• Improves Skin Elasticity - Advanced peptide technology enhances skin firmness and elasticity</Text>
                <Text style={styles.benefitItem}>• Anti-Aging Properties - Targets multiple signs of aging around the delicate eye area</Text>
                <Text style={styles.benefitItem}>• Professional Results - Delivers clinical-grade results for comprehensive eye care</Text>
              </>
            ) : product.name === 'EyeCell EYE ZONE CARE KIT' ? (
              <>
                <Text style={styles.benefitItem}>• Comprehensive Eye Care - Multi-faceted approach addressing wrinkles, dark circles, and puffiness</Text>
                <Text style={styles.benefitItem}>• Advanced Ingredients - Formulated with peptides, plant stem cell extracts, and hyaluronic acid</Text>
                <Text style={styles.benefitItem}>• Enhanced Absorption - Micro-needle roller ensures deeper penetration of active ingredients</Text>
                <Text style={styles.benefitItem}>• Professional and Home Use - Suitable for both professional treatments and daily home care</Text>
                <Text style={styles.benefitItem}>• Complete System - All-in-one kit for comprehensive eye area rejuvenation</Text>
                <Text style={styles.benefitItem}>• Visible Results - Delivers a more youthful, vibrant, and refreshed appearance</Text>
              </>
            ) : product.name === 'GENO-LED IR II' ? (
              <>
                <Text style={styles.benefitItem}>• Stimulates Collagen Production - Red light therapy promotes natural collagen synthesis for firmer, younger-looking skin</Text>
                <Text style={styles.benefitItem}>• Reduces Inflammation - Infrared light helps calm irritated skin and reduces redness and swelling</Text>
                <Text style={styles.benefitItem}>• Improves Skin Texture - Regular use enhances skin smoothness and reduces fine lines and wrinkles</Text>
                <Text style={styles.benefitItem}>• Accelerates Healing - Promotes faster recovery from skin treatments and reduces downtime</Text>
                <Text style={styles.benefitItem}>• Enhances Circulation - Improves blood flow and oxygen delivery to skin cells</Text>
                <Text style={styles.benefitItem}>• Safe and Non-Invasive - Gentle, pain-free treatment suitable for all skin types</Text>
              </>
            ) : product.name === 'SKIN REBOOT PDRN MASK PACK' ? (
              <>
                <Text style={styles.benefitItem}>• Skin Regeneration - Accelerates cell regeneration and improves skin texture</Text>
                <Text style={styles.benefitItem}>• Deep Hydration - Provides intense moisture for plump, dewy skin</Text>
                <Text style={styles.benefitItem}>• Elasticity Enhancement - Boosts skin firmness and elasticity</Text>
                <Text style={styles.benefitItem}>• Anti-Aging - Reduces fine lines and signs of aging</Text>
                <Text style={styles.benefitItem}>• Soothing Effect - Calms inflammation and supports skin healing</Text>
                <Text style={styles.benefitItem}>• Barrier Repair - Restores damaged skin barrier function</Text>
                <Text style={styles.benefitItem}>• Professional Results - Delivers clinical-grade skin rejuvenation</Text>
              </>
            ) : product.name === 'BIO-FERMENT AGE DEFYING POWDER MASK' ? (
              <>
                <Text style={styles.benefitItem}>• Age Defying - Reduces fine lines and wrinkles through advanced fermentation technology</Text>
                <Text style={styles.benefitItem}>• Bio-Ferment Technology - Harnesses the power of beneficial microorganisms for skin health</Text>
                <Text style={styles.benefitItem}>• Deep Penetration - Powder-to-mask formula ensures maximum ingredient absorption</Text>
                <Text style={styles.benefitItem}>• Antioxidant Protection - Neutralizes free radicals and environmental damage</Text>
                <Text style={styles.benefitItem}>• Skin Renewal - Promotes cellular turnover for younger-looking skin</Text>
                <Text style={styles.benefitItem}>• Hydration Boost - Provides intense moisture and plumping effects</Text>
                <Text style={styles.benefitItem}>• Firming Action - Improves skin elasticity and firmness</Text>
              </>
            ) : product.name === 'EGF REPAIR OXYMASK CREAM' ? (
              <>
                <Text style={styles.benefitItem}>• Oxygen Therapy - Supplies oxygen to the skin, improving cellular metabolism</Text>
                <Text style={styles.benefitItem}>• Skin Regeneration - Accelerates healing process and reduces skin irritations</Text>
                <Text style={styles.benefitItem}>• Anti-Inflammatory - Provides soothing effects for sensitive and damaged skin</Text>
                <Text style={styles.benefitItem}>• Deep Hydration - Promotes intense moisture retention and skin plumping</Text>
                <Text style={styles.benefitItem}>• Collagen Stimulation - Enhances skin elasticity and firmness</Text>
                <Text style={styles.benefitItem}>• EGF Technology - Advanced epidermal growth factor for cellular renewal</Text>
                <Text style={styles.benefitItem}>• Bubbling Action - Unique oxygen bubbling effect for enhanced penetration</Text>
              </>
            ) : product.name === 'EPI TURNOVER BOOSTING PEELING GEL' ? (
              <>
                <Text style={styles.benefitItem}>• Gentle Exfoliation - Effectively removes dead skin cells, promoting smoother skin texture</Text>
                <Text style={styles.benefitItem}>• Radiance Enhancement - Helps correct skin tone, resulting in a brighter complexion</Text>
                <Text style={styles.benefitItem}>• Deep Moisturization - Provides hydration to the skin, preventing dryness</Text>
                <Text style={styles.benefitItem}>• Pore Purification - Cleanses and purifies pores, reducing the likelihood of breakouts</Text>
                <Text style={styles.benefitItem}>• Enzyme Technology - Natural enzyme-based exfoliation for gentle skin renewal</Text>
                <Text style={styles.benefitItem}>• All Skin Types - Suitable for sensitive and all skin types</Text>
                <Text style={styles.benefitItem}>• Professional Results - Delivers salon-quality exfoliation at home</Text>
              </>
            ) : product.name === 'EZ CO₂ MASK KIT' ? (
              <>
                <Text style={styles.benefitItem}>• Oxygen Therapy - Accelerates oxygen delivery to skin tissues through CO₂ therapy</Text>
                <Text style={styles.benefitItem}>• Skin Firming - Provides firming effects through improved cellular metabolism</Text>
                <Text style={styles.benefitItem}>• Brightening - Helps correct skin tone and reduce hyperpigmentation</Text>
                <Text style={styles.benefitItem}>• Anti-Blemish - Reduces blemishes and improves overall skin clarity</Text>
                <Text style={styles.benefitItem}>• Catalytic Effect - Prepares skin for optimal absorption of active ingredients</Text>
                <Text style={styles.benefitItem}>• Professional Results - Delivers salon-quality carboxy therapy at home</Text>
                <Text style={styles.benefitItem}>• Microneedling Enhancement - Acts as a catalytic mask for better treatment results</Text>
              </>
            ) : product.name === 'SKIN RESCUE OVERNIGHT CREAM MASK' ? (
              <>
                <Text style={styles.benefitItem}>• Skin Revitalization - Provides intensive care to fatigued and stressed skin</Text>
                <Text style={styles.benefitItem}>• Oxygen Therapy - Delivers instant oxygen therapy for skin renewal and energy</Text>
                <Text style={styles.benefitItem}>• Overnight Recovery - Works while you sleep to repair and rejuvenate skin</Text>
                <Text style={styles.benefitItem}>• Erythema Improvement - Helps reduce redness and skin irritation</Text>
                <Text style={styles.benefitItem}>• Moisture Retention - Improves transepidermal water loss for better hydration</Text>
                <Text style={styles.benefitItem}>• Growth Factor Benefits - Stimulates natural skin renewal and healing processes</Text>
              </>
            ) : product.name === 'HR³ MATRIX HAIR SOLUTION α' ? (
              <>
                <Text style={styles.benefitItem}>• Prevents Hair Loss</Text>
                <Text style={styles.benefitItem}>  Targets fundamental causes of hair loss and inhibits substances responsible for hair thinning</Text>
                <Text style={styles.benefitItem}>• Promotes Hair Regrowth</Text>
                <Text style={styles.benefitItem}>  • Accelerates angiogenesis and stimulates hair follicle activity for new growth</Text>
                <Text style={styles.benefitItem}>• Strengthens Hair Follicles</Text>
                <Text style={styles.benefitItem}>  Provides essential nutrients and peptides for stronger, healthier hair</Text>
                <Text style={styles.benefitItem}>• Improves Scalp Health</Text>
                <Text style={styles.benefitItem}>  Nourishes and revitalizes the scalp environment for optimal hair growth</Text>
                <Text style={styles.benefitItem}>• Enhances Blood Circulation</Text>
                <Text style={styles.benefitItem}>  Increases nutrient delivery to hair follicles through improved blood flow</Text>
                <Text style={styles.benefitItem}>• Antioxidant Protection</Text>
                <Text style={styles.benefitItem}>  Sophora Japonica and other botanical extracts provide antioxidant benefits</Text>
              </>
            ) : product.name === 'HR³ MATRIX MESOPECIA KIT' ? (
              <>
                <Text style={styles.benefitItem}>• Inhibits Hair Loss Causes - Targets root causes including 5α-reductase inhibition to suppress DHT conversion</Text>
                <Text style={styles.benefitItem}>• Stimulates Hair Growth - Supplies essential nutrients to hair follicles and promotes angiogenesis for new hair growth</Text>
                <Text style={styles.benefitItem}>• Regulates Sebum Secretion</Text>
                <Text style={styles.benefitItem}>  • Controls excessive sebum production for balanced and healthy scalp environment</Text>
                <Text style={styles.benefitItem}>• Deep Scalp Cleansing - Removes keratin, sebum, and impurities for optimal treatment absorption</Text>
                <Text style={styles.benefitItem}>• Enhanced Absorption - Roller device ensures deeper penetration of active ingredients</Text>
                <Text style={styles.benefitItem}>• Comprehensive Treatment - Complete system addressing all aspects of hair loss and scalp health</Text>
              </>
            ) : product.name === 'HR³ MATRIX HAIR TONIC α' ? (
              <>
                <Text style={styles.benefitItem}>• Strengthens Hair Follicles - Provides essential nutrients and peptides for stronger, healthier hair</Text>
                <Text style={styles.benefitItem}>• Improves Scalp Health - Nourishes and revitalizes the scalp environment for optimal hair growth</Text>
                <Text style={styles.benefitItem}>• Enhances Blood Circulation - Increases nutrient delivery to hair follicles through improved blood flow</Text>
                <Text style={styles.benefitItem}>• Prevents Hair Loss - Targets fundamental causes of hair thinning and provides protective benefits</Text>
                <Text style={styles.benefitItem}>• Promotes Hair Growth</Text>
                <Text style={styles.benefitItem}>  Stimulates hair follicle activity and supports natural hair regrowth</Text>
                <Text style={styles.benefitItem}>• Antioxidant Protection - Botanical extracts provide antioxidant benefits for scalp protection</Text>
              </>
            ) : product.name === 'HR³ MATRIX SCALP PEELING α' ? (
              <>
                <Text style={styles.benefitItem}>• Gentle Scalp Exfoliation - Effectively removes keratinized particles and dead skin cells</Text>
                <Text style={styles.benefitItem}>• Refreshing Cooling Effect - Provides a soothing, cooling sensation for scalp comfort</Text>
                <Text style={styles.benefitItem}>• Disinfecting Properties - Helps cleanse the scalp and prepare for treatment</Text>
                <Text style={styles.benefitItem}>• Anti-Inflammatory Action - Reduces inflammation and soothes irritated scalp</Text>
                <Text style={styles.benefitItem}>• Enhanced Blood Circulation - Stimulates blood flow to hair follicles</Text>
                <Text style={styles.benefitItem}>• Treatment Preparation - Optimizes scalp condition for microneedling procedures</Text>
              </>
            ) : product.name === 'HR³ MATRIX SCALP SHAMPOO α' ? (
              <>
                <Text style={styles.benefitItem}>• Hair Loss Prevention - KFDA-approved functional product for improving hair loss symptoms</Text>
                <Text style={styles.benefitItem}>• Scalp Cooling Effect - Reduces scalp heat and provides refreshing sensation</Text>
                <Text style={styles.benefitItem}>• Sebum Control - Effectively manages excess sebum production for balanced scalp</Text>
                <Text style={styles.benefitItem}>• Scalp Health - Promotes healthy scalp environment for optimal hair growth</Text>
                <Text style={styles.benefitItem}>• Professional Quality - Advanced formulation with patented ingredients</Text>
                <Text style={styles.benefitItem}>• Dermatologically Tested - Safe for regular use on all hair types</Text>
              </>
            ) : product.name === 'INTENSIVE HYDRO SOOTHING CREAM' ? (
              <>
                <Text style={styles.benefitItem}>• Intensive Hydration - Provides long-lasting moisture for all skin types</Text>
                <Text style={styles.benefitItem}>• Skin Soothing - Calms irritation and reduces redness and inflammation</Text>
                <Text style={styles.benefitItem}>• Skin Repair - Promotes natural healing and skin regeneration</Text>
                <Text style={styles.benefitItem}>• Barrier Protection - Strengthens skin's natural protective barrier</Text>
                <Text style={styles.benefitItem}>• Gentle Care - Suitable for sensitive and irritated skin</Text>
                <Text style={styles.benefitItem}>• Versatile Use - Perfect for both professional treatments and daily home care</Text>
              </>
            ) : product.name === 'INTENSIVE BLEMISH BALM CREAM [SPF 30 PA++]' ? (
              <>
                <Text style={styles.benefitItem}>• Natural Coverage - Provides flawless coverage while maintaining natural skin appearance</Text>
                <Text style={styles.benefitItem}>• Sun Protection - SPF 30 PA++ shields skin from harmful UV rays and environmental damage</Text>
                <Text style={styles.benefitItem}>• Blemish Concealing - Effectively covers redness, blemishes, and skin imperfections</Text>
                <Text style={styles.benefitItem}>• Post-Treatment Care - Safe for use after dermatological procedures and treatments</Text>
                <Text style={styles.benefitItem}>• Environmental Protection - Guards against harmful environmental factors and pollutants</Text>
                <Text style={styles.benefitItem}>• Skin Tone Enhancement - Helps express and enhance your natural skin tone</Text>
              </>
            ) : product.name === 'INTENSIVE PROBLEM CONTROL CREAM' ? (
              <>
                <Text style={styles.benefitItem}>• Anti-microbial - Helps combat bacteria and prevent breakouts</Text>
                <Text style={styles.benefitItem}>• Anti-inflammatory - Reduces redness and calms irritated skin</Text>
                <Text style={styles.benefitItem}>• Sebum Control - Regulates oil production for balanced skin</Text>
                <Text style={styles.benefitItem}>• Soothing Relief - Provides comfort for problematic skin</Text>
                <Text style={styles.benefitItem}>• Skin Barrier Support - Strengthens the skin's natural defenses</Text>
                <Text style={styles.benefitItem}>• Moisture Retention - Keeps skin hydrated without clogging pores</Text>
              </>
            ) : product.name === 'INTENSIVE PROBLEM CONTROL TONER' ? (
              <>
                <Text style={styles.benefitItem}>• Intensive Problem Control - Targets acne, blemishes, and skin irritations effectively</Text>
                <Text style={styles.benefitItem}>• Pore Minimizing - Helps reduce pore size and tighten skin texture</Text>
                <Text style={styles.benefitItem}>• Skin Soothing - Calms irritated and sensitive skin with anti-inflammatory properties</Text>
                <Text style={styles.benefitItem}>• Dead Skin Cell Removal - Gently exfoliates and removes impurities for clearer skin</Text>
                <Text style={styles.benefitItem}>• pH Balancing - Restores optimal skin pH levels for healthy skin barrier</Text>
                <Text style={styles.benefitItem}>• Professional Results - Delivers clinical-grade benefits for problem skin management</Text>
              </>
            ) : product.name === 'HairGen BOOSTER' ? (
              <>
                <Text style={styles.benefitItem}>• Enhanced Hair Growth - Stimulates hair follicles and promotes natural hair regrowth</Text>
                <Text style={styles.benefitItem}>• Improved Scalp Health - Increases blood circulation and nutrient delivery to hair roots</Text>
                <Text style={styles.benefitItem}>• Collagen Production - Promotes scalp regeneration and strengthens hair structure</Text>
                <Text style={styles.benefitItem}>• Nutrient Absorption - Creates pathways for better penetration of hair care products</Text>
                <Text style={styles.benefitItem}>• Professional Results - Advanced technology for both professional and home use</Text>
                <Text style={styles.benefitItem}>• Non-Invasive Treatment - Safe and effective without side effects</Text>
              </>
            ) : product.name === 'Hair-GENTRON' ? (
              <>
                <Text style={styles.benefitItem}>• Hair Growth Stimulation - Promotes natural hair growth through advanced light therapy</Text>
                <Text style={styles.benefitItem}>• Improved Blood Circulation - Enhances scalp blood flow for better nutrient delivery to hair follicles</Text>
                <Text style={styles.benefitItem}>• Non-Invasive Treatment - Safe and painless therapy without side effects</Text>
                <Text style={styles.benefitItem}>• Professional & Home Use - Suitable for both professional clinics and home care</Text>
                <Text style={styles.benefitItem}>• Stress Relief - Massaging function helps reduce tension and stress</Text>
                <Text style={styles.benefitItem}>• Optimal Light Distance - Guaranteed proper distance from light source to scalp for maximum effectiveness</Text>
              </>
            ) : product.name === 'HYDRO COOL MODELING MASK' ? (
              <>
                <Text style={styles.benefitItem}>• Immediate Cooling Effect - Provides instant cooling and refreshing sensation</Text>
                <Text style={styles.benefitItem}>• Post-Treatment Soothing - Calms and soothes skin after professional treatments</Text>
                <Text style={styles.benefitItem}>• Enhanced Hydration - Delivers deep moisture and improves skin hydration</Text>
                <Text style={styles.benefitItem}>• Pore Minimizing - Helps reduce pore size for smoother skin texture</Text>
                <Text style={styles.benefitItem}>• Skin Barrier Support - Strengthens and enhances skin barrier function</Text>
                <Text style={styles.benefitItem}>• Collagen Synthesis - Stimulates collagen production for firmer skin</Text>
              </>
            ) : product.name === 'INTENSIVE HYDRO SOOTHING CREAM' ? (
              <>
                <Text style={styles.benefitItem}>• Intensive Hydration - Provides long-lasting moisture for all skin types</Text>
                <Text style={styles.benefitItem}>• Skin Soothing - Calms irritation and reduces redness and inflammation</Text>
                <Text style={styles.benefitItem}>• Skin Repair - Promotes natural healing and skin regeneration</Text>
                <Text style={styles.benefitItem}>• Barrier Protection - Strengthens skin's natural protective barrier</Text>
                <Text style={styles.benefitItem}>• Gentle Care - Suitable for sensitive and irritated skin</Text>
                <Text style={styles.benefitItem}>• Versatile Use - Perfect for both professional treatments and daily home care</Text>
              </>
            ) : product.name === 'MICROBIOME ENERGY INFUSING MIST' ? (
              <>
                <Text style={styles.benefitItem}>• Microbiome Balance - Restores and maintains healthy skin microbiome</Text>
                <Text style={styles.benefitItem}>• Instant Hydration - Provides immediate moisture and long-lasting hydration</Text>
                <Text style={styles.benefitItem}>• Natural Radiance - Enhances skin's natural glow and radiance</Text>
                <Text style={styles.benefitItem}>• Barrier Strengthening - Improves skin's natural moisture barrier function</Text>
                <Text style={styles.benefitItem}>  and enhances skin's natural defense mechanisms</Text>
                <Text style={styles.benefitItem}>• Skin Revitalization - Energizes and revitalizes tired, stressed skin</Text>
                <Text style={styles.benefitItem}>• Gentle Care - Suitable for all skin types, including sensitive skin</Text>
              </>
            ) : product.name === 'MULTI FUNCTIONAL ANTI-WRINKLE SERUM' ? (
              <>
                <Text style={styles.benefitItem}>• Wrinkle Reduction - Visibly smooths fine lines and deep wrinkles for younger-looking skin</Text>
                <Text style={styles.benefitItem}>• Skin Firmness - Reinforces skin elasticity and firmness</Text>
                <Text style={styles.benefitItem}>  for a more lifted appearance</Text>
                <Text style={styles.benefitItem}>• Gentle Formula - Natural bakuchiol provides retinol-like benefits without irritation or sensitivity</Text>
                <Text style={styles.benefitItem}>• Enhanced Penetration - Lipid barrier technology ensures optimal ingredient delivery</Text>
                <Text style={styles.benefitItem}>• Skin Tone Balance - Improves overall skin tone and texture for radiant complexion</Text>
                <Text style={styles.benefitItem}>• Anti-Aging Protection - Comprehensive approach to preventing and reversing signs of aging</Text>
              </>
            ) : product.name === 'MOISTURE REPLENISHING HYALURON CREAM' ? (
              <>
                <Text style={styles.benefitItem}>• Deep Hydration - Multi-layered moisture delivery for comprehensive skin hydration</Text>
                <Text style={styles.benefitItem}>• Long-Lasting Results - 72-hour hydration persistence for sustained moisture</Text>
                <Text style={styles.benefitItem}>• Skin Barrier Protection - Strengthens moisture barrier to prevent water loss</Text>
                <Text style={styles.benefitItem}>• Cooling Sensation - Natural cooling agents provide instant skin refreshment</Text>
                <Text style={styles.benefitItem}>• Anti-Aging Benefits - Reduces fine lines and improves skin elasticity</Text>
                <Text style={styles.benefitItem}>• All Skin Types - Suitable for all skin types, including sensitive skin</Text>
                <Text style={styles.benefitItem}>• Professional Results - Salon-quality hydration at home</Text>
              </>
            ) : product.name === 'INTENSIVE PROBLEM CONTROL CREAM' ? (
              <>
                <Text style={styles.benefitItem}>• Anti-microbial - Helps combat bacteria and prevent breakouts</Text>
                <Text style={styles.benefitItem}>• Anti-inflammatory - Reduces redness and calms irritated skin</Text>
                <Text style={styles.benefitItem}>• Sebum Control - Regulates oil production for balanced skin</Text>
                <Text style={styles.benefitItem}>• Soothing Relief - Provides comfort for problematic skin</Text>
                <Text style={styles.benefitItem}>• Skin Barrier Support - Strengthens the skin's natural defenses</Text>
                <Text style={styles.benefitItem}>• Moisture Retention - Keeps skin hydrated without clogging pores</Text>
              </>
            ) : product.name === 'MOISTURE REPLENISHING HYALURON SERUM' ? (
              <>
                <Text style={styles.benefitItem}>• Deep Hydration - Multi-layer moisture delivery for comprehensive skin hydration</Text>
                <Text style={styles.benefitItem}>• Moisture Retention - Prevents moisture evaporation with barrier-forming technology</Text>
                <Text style={styles.benefitItem}>• Natural Hydration - Coconut water provides electrolytes for optimal skin balance</Text>
                <Text style={styles.benefitItem}>• Anti-Inflammatory - Mushroom extracts soothe and protect skin from environmental damage</Text>
                <Text style={styles.benefitItem}>• Enhanced Penetration - Aquaporin stimulation improves moisture transport into skin</Text>
                <Text style={styles.benefitItem}>• Long-Lasting Results - Sustained hydration that lasts throughout the day</Text>
              </>
            ) : product.name === 'MULTI SUN CREAM [SPF 40 PA++]' ? (
              <>
                <Text style={styles.benefitItem}>• UV Protection - Comprehensive protection against UVA and UVB rays</Text>
                <Text style={styles.benefitItem}>• Skin Soothing - Calms and soothes skin irritated by sun exposure</Text>
                <Text style={styles.benefitItem}>• Natural Glow - Enhances skin's natural radiance and luminosity</Text>
                <Text style={styles.benefitItem}>• Moisture Lock - Helps maintain skin hydration while protecting from sun damage</Text>
                <Text style={styles.benefitItem}>• Anti-Aging - Prevents premature aging caused by UV exposure</Text>
                <Text style={styles.benefitItem}>• Gentle Care - Suitable for sensitive skin and daily use</Text>
              </>
            ) : product.name === 'MULTI FUNCTIONAL ANTI-WRINKLE CREAM' ? (
              <>
                <Text style={styles.benefitItem}>• Wrinkle Reduction - Smooths fine lines and wrinkles, improving skin texture</Text>
                <Text style={styles.benefitItem}>• Firming - Enhances skin firmness and elasticity for a more youthful appearance</Text>
                <Text style={styles.benefitItem}>• Collagen Synthesis - Promotes the production of collagen for skin rejuvenation</Text>
                <Text style={styles.benefitItem}>• Antioxidant Protection - Shields the skin from oxidative stress and environmental damage</Text>
                <Text style={styles.benefitItem}>• Brightening - Evens out skin tone and adds natural radiance</Text>
                <Text style={styles.benefitItem}>• Deep Hydration - Provides intense moisture for plump, healthy-looking skin</Text>
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

        {product.name !== 'HairGen BOOSTER' && product.name !== 'Hair-GENTRON' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Ingredients</Text>
          <View style={styles.ingredientsList}>
            {product.name === 'INTENSIVE HYDRO SOOTHING CREAM' ? (
              <>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Aloe Barbadensis Leaf Extract:</Text> Natural soothing and healing ingredient that calms irritated skin and provides gentle hydration.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Snail Secretion Filtrate:</Text> Premium ingredient rich in glycoproteins and growth factors that promote skin regeneration and healing.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Hyaluronic Acid:</Text> Powerful humectant that attracts and retains moisture, providing intense hydration and plumping effects.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Lactobacillus/Pumpkin Ferment Extract:</Text> Fermented ingredient that provides probiotics and nutrients for improved skin health and texture.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Beta-Glucan:</Text> Natural immune-boosting ingredient that enhances skin's defense mechanisms and promotes healing.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Phytolex SC:</Text> Advanced botanical complex that provides additional skin protection and soothing benefits.</Text>
              </>
            ) : product.name === 'INTENSIVE BLEMISH BALM CREAM [SPF 30 PA++]' ? (
              <>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Adenosine:</Text> Anti-aging ingredient that helps reduce fine lines and wrinkles while promoting skin renewal.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Allantoin:</Text> Soothing and healing ingredient that calms irritated skin and promotes skin regeneration.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Origanum Vulgare Leaf Extract:</Text> Natural antioxidant extract that provides protection against environmental damage and free radicals.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Phytolex SC:</Text> Advanced botanical complex that enhances skin protection and provides natural coverage benefits.</Text>
              </>
            ) : product.name === 'INTENSIVE PROBLEM CONTROL CREAM' ? (
              <>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Zinc PCA:</Text> A powerful sebum-regulating ingredient that helps control oil production and has antimicrobial properties to prevent breakouts and maintain clear skin.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Panthenol (Vitamin B5):</Text> Provides deep hydration and has anti-inflammatory properties that help soothe irritated skin while promoting healing and skin barrier function.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Beta-Glucan:</Text> A natural immune-boosting ingredient that helps strengthen the skin's defense mechanisms, reduce inflammation, and promote healing.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Allantoin:</Text> A gentle, soothing ingredient that helps calm irritated skin, reduce redness, and promote skin healing while being suitable for sensitive skin.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Lactobacillus/Pumpkin Ferment Extract:</Text> A probiotic ingredient that helps balance the skin's microbiome, providing natural antimicrobial benefits and supporting healthy skin flora.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Trehalose:</Text> A natural sugar that acts as a humectant, helping to retain moisture and protect the skin from environmental stressors while maintaining skin hydration.</Text>
              </>
            ) : product.name === 'INTENSIVE PROBLEM CONTROL TONER' ? (
              <>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Salicylic Acid:</Text> Beta-hydroxy acid that penetrates pores to dissolve dead skin cells and excess oil, helping to prevent acne breakouts and improve skin texture.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Witch Hazel Extract:</Text> Natural astringent that tightens pores, reduces inflammation, and provides soothing relief for irritated and sensitive skin.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Tea Tree Extract:</Text> Powerful antimicrobial and anti-inflammatory agent that helps combat acne-causing bacteria while soothing irritated skin.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Aloe Vera Extract:</Text> Soothing and healing ingredient that calms inflammation, reduces redness, and promotes skin healing for problem areas.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Niacinamide:</Text> Vitamin B3 derivative that helps regulate sebum production, minimize pores, and improve skin barrier function for healthier skin.</Text>
              </>
            ) : product.name === 'ALL FOR SENSITIVE SERUM' ? (
              <>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>MultiEx BSASM® Plus:</Text> A patented complex that helps strengthen the skin barrier and provides long-lasting hydration while protecting sensitive skin from environmental stressors.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Phytolex SC:</Text> A plant-derived ingredient that provides natural anti-inflammatory benefits and helps soothe irritated skin while supporting the skin's natural healing process.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Hyaluronic Acid:</Text> A powerful humectant that attracts and retains moisture, providing deep hydration without causing irritation or clogging pores.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Phytosphingosine:</Text> A natural lipid that helps restore the skin's barrier function and provides gentle antimicrobial protection while being suitable for sensitive skin.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Aloe Barbadensis Leaf Extract:</Text> Known for its soothing and healing properties, aloe vera helps calm irritated skin, reduce inflammation, and provide natural moisture to sensitive skin.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Hamamelis Virginiana (Witch Hazel) Extract:</Text> A natural astringent that helps tighten pores, reduce inflammation, and provide gentle cleansing properties while being gentle on sensitive skin.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Beta-Glucan:</Text> A natural immune-boosting ingredient that helps strengthen the skin's defense mechanisms, reduce inflammation, and promote healing in sensitive skin.</Text>
              </>
            ) : product.name === 'EyeCell EYE CONTOUR CREAM' ? (
              <>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Palmitoyl Hexapeptide-12:</Text> Stimulates fibroblast cell growth, imparting firming effects and helping to improve skin elasticity around the delicate eye area.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Copper Tripeptide-1:</Text> Promotes collagen synthesis in skin fibroblasts, aiding in skin regeneration and helping to reduce the appearance of fine lines and wrinkles.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Rosa Damascena Callus Culture Extract:</Text> Offers moisturizing, soothing, and whitening effects with anti-aging benefits, helping to brighten the eye area and reduce signs of aging.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Scutellaria Baicalensis Root Extract:</Text> Provides anti-inflammatory, antioxidant, antimicrobial, antifungal, antiviral, and free radical scavenging properties for comprehensive skin protection.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Sodium Hyaluronate:</Text> Hydrates the skin, reduces water loss, minimizes the appearance of wrinkles and fine lines, and improves skin elasticity for a more youthful appearance.</Text>
              </>
            ) : product.name === 'EyeCell EYE CONTOUR SERUM' ? (
              <>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Palmitoyl Hexapeptide-12:</Text> Stimulates fibroblast growth for firming effects and improved skin elasticity around the delicate eye area.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Copper Tripeptide-1:</Text> Promotes collagen synthesis and skin regeneration, reducing fine lines and wrinkles for a more youthful appearance.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Acetyl Hexapeptide-8:</Text> Acts as muscle relaxant, reducing wrinkle appearance and expression lines for smoother skin.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Anti-Dark Circle Complex (Haloxyl™):</Text> Specialized complex for dark circle reduction and skin strengthening, targeting under-eye discoloration.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Vitis Vinifera (Grape) Callus Culture Extract:</Text> Provides antioxidant and skin-renewing properties with anti-aging benefits for enhanced skin health.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Rosa Damascena Callus Culture Extract:</Text> Offers moisturizing, soothing, and whitening effects with anti-aging benefits, helping to brighten the eye area.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Adenosine:</Text> Provides anti-aging and skin-soothing properties with wrinkle-reducing effects for improved skin texture.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Arbutin:</Text> Natural skin brightening agent that helps even skin tone and reduce the appearance of dark spots.</Text>
              </>
            ) : product.name === 'EyeCell EYE PEPTIDE GEL PATCH' ? (
              <>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Peptide Complex:</Text> Includes Copper Tripeptide-1, Acetyl Hexapeptide-8, Palmitoyl Hexapeptide-12, Palmitoyl Oligopeptide, and Palmitoyl Tetrapeptide-7 to reduce fine lines and improve skin elasticity.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Hyaluronic Acid:</Text> Increases skin moisture levels, plumping the eye area and providing deep hydration for a refreshed appearance.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Arbutin:</Text> Natural skin brightening agent that helps reduce the appearance of dark circles and evens skin tone.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Retinyl Palmitate:</Text> Vitamin A derivative that supports skin renewal and combats signs of aging around the eye area.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Botanical Extracts:</Text> Chamomile, Lavender, Peppermint, and Rosemary extracts that soothe and revitalize the delicate eye area.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Adenosine:</Text> Provides anti-aging and skin-soothing properties with wrinkle-reducing effects for improved skin texture.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Niacinamide:</Text> Amide of nicotinic acid (Vitamin B3) that evens out skin tone, improves discolorations, and protects skin against oxidative stress.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Centella Asiatica Extract:</Text> Provides wound healing effect, antioxidation effect, and promotes collagen synthesis.</Text>
              </>
            ) : product.name === 'EyeCell EYE ZONE CARE KIT' ? (
              <>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>EC Peptide Complex:</Text> Advanced peptide complex including Palmitoyl Hexapeptide-12, Copper Tripeptide-1, and Acetyl Hexapeptide-8 for anti-wrinkle and firming effects.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Hydrolyzed Collagen:</Text> Supports skin structure and elasticity, promoting a more youthful appearance around the eye area.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Adenosine:</Text> Provides anti-aging and skin-soothing properties with wrinkle-reducing effects for improved skin texture.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Botanical Stem Cell Extracts:</Text> Rosa Damascena and Vitis Vinifera callus culture extracts for skin renewal and antioxidant protection.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Haloxyl™:</Text> Anti-dark circle complex that targets under-eye discoloration and strengthens the delicate eye area.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Made White™:</Text> Patented complex for melanin synthesis inhibition and skin brightening effects.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Niacinamide:</Text> Vitamin B3 that evens skin tone, improves discolorations, and protects against oxidative stress.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Sodium Hyaluronate:</Text> Deep hydration and moisture retention for plumped, youthful-looking skin.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Centella Asiatica Extract:</Text> Wound healing and collagen synthesis promotion for enhanced skin repair.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Scutellaria Baicalensis Root Extract:</Text> Anti-inflammatory and antioxidant properties for comprehensive skin protection.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Aloe Barbadensis Leaf Powder:</Text> Soothing and moisturizing properties for gentle skin care.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Simmondsia Chinensis (Jojoba) Seed Oil:</Text> Natural moisturizing oil that mimics skin's natural sebum for optimal absorption.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Allantoin:</Text> Skin-soothing and anti-inflammatory properties for gentle, effective care.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Panthenol:</Text> Provitamin B5 that provides deep penetrating moisture and reduces inflammation.</Text>
              </>
            ) : product.name === 'SKIN REBOOT PDRN MASK PACK' ? (
              <>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>PDRN (Polydeoxyribonucleotide):</Text> DNA-based ingredient derived from salmon that accelerates skin regeneration, improves elasticity, and promotes healing.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Panthenol (Pro-Vitamin B5):</Text> Deeply hydrates and soothes the skin while supporting the skin barrier and promoting wound healing.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Hyaluronic Acid:</Text> Provides deep moisture retention, plumps the skin, and helps reduce the appearance of fine lines and wrinkles.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Peptide Complex:</Text> Stimulates collagen production and improves skin firmness for a more youthful, resilient complexion.</Text>
              </>
            ) : product.name === 'BIO-FERMENT AGE DEFYING POWDER MASK' ? (
              <>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Bio-Fermented Extracts:</Text> Advanced fermentation process creates beneficial compounds, peptides, and amino acids that enhance skin barrier function and provide anti-aging benefits through natural biological processes.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Fermented Rice Extract:</Text> Rich in vitamins, minerals, and antioxidants, fermented rice provides gentle exfoliation and brightening effects while nourishing the skin with essential nutrients.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Fermented Soybean Extract:</Text> Contains isoflavones and peptides that help improve skin elasticity, reduce inflammation, and provide antioxidant protection against environmental stressors.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Fermented Green Tea Extract:</Text> Enhanced antioxidant properties through fermentation, providing superior protection against free radicals and helping to reduce signs of aging and environmental damage.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Fermented Ginseng Extract:</Text> Traditional Korean ingredient enhanced through fermentation, providing energizing and revitalizing effects while improving skin tone and reducing fatigue signs.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Hyaluronic Acid:</Text> Provides intense hydration and plumping effects, helping to reduce the appearance of fine lines and wrinkles while maintaining optimal skin moisture levels.</Text>
              </>
            ) : product.name === 'EGF REPAIR OXYMASK CREAM' ? (
              <>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>sh-Oligopeptide-1 (EGF):</Text> Epidermal Growth Factor stimulates cell proliferation and aids in wound healing, promoting faster skin recovery and regeneration.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Madecassoside:</Text> Derived from Centella Asiatica, it combats redness, reduces itching, and soothes sensitive skin while providing anti-inflammatory benefits.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Copper Tripeptide-1:</Text> Promotes collagen synthesis and has wound-healing properties, helping to improve skin texture and reduce signs of aging.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>SEPITONIC M3 (Mineral Complex):</Text> Enhances cellular metabolism and revitalizes the skin, providing essential minerals for optimal skin function and health.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Salmon Oil:</Text> Rich in unsaturated fatty acids, it offers anti-inflammatory and wound-healing effects while providing deep nourishment to the skin.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Adenosine:</Text> Provides anti-aging benefits by reducing the appearance of wrinkles and fine lines, promoting smoother, more youthful-looking skin.</Text>
              </>
            ) : product.name === 'EPI TURNOVER BOOSTING PEELING GEL' ? (
              <>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Natural Enzymes:</Text> Facilitate gentle exfoliation by breaking down dead skin cells naturally, providing effective yet non-irritating skin renewal.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Retinol (Vitamin A):</Text> Promotes skin renewal and improves texture while supporting cellular turnover for a more youthful appearance.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Provitamin A:</Text> Supports skin health and regeneration, providing essential nutrients for optimal skin function and recovery.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Vitamin E:</Text> Provides antioxidant protection and moisturization, helping to protect the skin from environmental damage while maintaining hydration.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Vitamin C (Ascorbic Acid):</Text> Brightens the skin and boosts collagen production, helping to reduce signs of aging and improve skin radiance.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Allantoin:</Text> Soothes and calms the skin, reducing irritation and providing gentle care for sensitive skin during exfoliation.</Text>
              </>
            ) : product.name === 'EZ CO₂ MASK KIT' ? (
              <>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Lactic Acid:</Text> Gentle exfoliation and skin renewal</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Portulaca Oleracea Extract:</Text> Antioxidant and anti-inflammatory properties</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Rosemary Leaf Extract:</Text> Antimicrobial and circulation-boosting effects</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Chamomile Flower Extract:</Text> Soothing and anti-inflammatory benefits</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Licorice Root Extract:</Text> Skin brightening and anti-inflammatory properties</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Scutellaria Baicalensis Root Extract:</Text> Antioxidant and anti-aging benefits</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Centella Asiatica Extract:</Text> Wound healing and anti-inflammatory effects</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Green Tea Leaf Extract:</Text> Antioxidant protection and skin renewal</Text>
              </>
            ) : product.name === 'INTENSIVE BLEMISH BALM CREAM [SPF 30 PA++]' ? (
              <>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Adenosine:</Text> Anti-aging ingredient that helps reduce fine lines and wrinkles while promoting skin renewal.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Allantoin:</Text> Soothing and healing ingredient that calms irritated skin and promotes skin regeneration.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Origanum Vulgare Leaf Extract:</Text> Natural antioxidant extract that provides protection against environmental damage and free radicals.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Phytolex SC:</Text> Advanced botanical complex that enhances skin protection and provides natural coverage benefits.</Text>
              </>
            ) : product.name === 'SKIN RESCUE OVERNIGHT CREAM MASK' ? (
              <>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Pink Ceramide Complex:</Text> Unique ceramide complex that provides intensive skin protection and recovery benefits.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Oxygen Capsules:</Text> Italian oxygenated water capsules that burst on contact for instant oxygen therapy.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Growth Factor Complex:</Text> EGF, aFGF, bFGF, PIGF, IGF work together to promote skin renewal and healing.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Pumpkin Extract:</Text> Cucurbita Pepo fruit extract provides antioxidant protection and skin nourishment.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Phytosphingosine:</Text> Natural lipid that helps strengthen skin barrier and improve moisture retention.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Swelling Controller:</Text> Special ingredient that helps control swelling and inflammation for comfortable application.</Text>
              </>
            ) : product.name === 'HYDRO COOL MODELING MASK' ? (
              <>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Centella Asiatica Extract:</Text> Powerful botanical extract that increases collagen synthesis, enhances skin barrier function, and provides anti-inflammatory benefits for improved skin health and texture.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Hyaluronic Acid:</Text> Deep hydrating ingredient that attracts and retains moisture, providing intense hydration and plumping effects for smoother, more youthful-looking skin.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Ceramide:</Text> Essential lipid that strengthens the skin barrier, locks in moisture, and protects against environmental damage for healthier, more resilient skin.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Allantoin:</Text> Soothing and healing ingredient that calms irritated skin, promotes cell regeneration, and provides gentle exfoliation for improved skin texture.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Mentha Piperita (Peppermint) Extract:</Text> Natural cooling agent that provides refreshing sensation, soothes inflammation, and helps reduce skin redness and irritation.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Chamaecyparis Obtusa Water:</Text> Purified water extract that provides gentle hydration and soothing properties, helping to calm and refresh the skin naturally.</Text>
              </>
            ) : product.name === 'HR³ MATRIX HAIR SOLUTION α' ? (
              <>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Sh-polypeptide-71:</Text> Supports hair follicle health and growth stimulation for stronger, healthier hair.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Copper Tripeptide-1:</Text> Promotes collagen synthesis and hair strength for improved hair quality.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Pentapeptide-20:</Text> Aids in hair growth and follicle nourishment for optimal hair development.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Sophora Japonica Bud Extract:</Text> Antioxidant properties for scalp protection and hair health.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Portulaca Oleracea:</Text> Traditional herb for scalp nourishment and hair strengthening.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Polygonum Multiflorum Root:</Text> Known for hair strengthening properties and scalp health.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Angelica Gigas Root:</Text> Supports scalp health and circulation for better hair growth.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Niacinamide:</Text> Improves blood circulation in the scalp for enhanced nutrient delivery.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Citrus Paradisi Seed Oil:</Text> Provides antimicrobial benefits for scalp health and protection.</Text>
              </>
            ) : product.name === 'HR³ MATRIX SCALP PEELING α' ? (
              <>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Salicylic Acid:</Text> Provides gentle exfoliation to remove dead skin cells and unclog hair follicles, promoting healthier scalp condition and improved treatment absorption.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Menthol:</Text> Delivers a refreshing, cooling sensation that soothes the scalp and provides immediate comfort during and after application.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Sophora Japonica Linn Extract:</Text> Provides antioxidant properties and helps reduce inflammation, promoting scalp health and creating an optimal environment for hair growth.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Green Tea Extract:</Text> Provides anti-inflammatory and antioxidant benefits, helping to soothe the scalp and protect against environmental damage.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Grapefruit Seed Oil:</Text> Provides natural antimicrobial properties to help cleanse the scalp and maintain a healthy scalp environment.</Text>
              </>
            ) : product.name === 'HR³ MATRIX SCALP SHAMPOO α' ? (
              <>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Patented Viscum Album Extract:</Text> A patented extract that helps inhibit hair loss and promotes healthy hair growth by improving scalp circulation and nutrient delivery to hair follicles.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Patented HP-DCC Complex:</Text> Advanced complex that targets the root causes of hair loss, providing comprehensive scalp care and promoting stronger, healthier hair growth.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Saccharomyces Cerevisiae Extract:</Text> Fermented yeast extract that provides essential nutrients for hair follicles, promoting healthy hair growth and improving scalp condition.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Acorus Calamus Root Extract:</Text> Traditional herbal extract known for its scalp-soothing properties and ability to improve blood circulation in the scalp area.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Piroctone Olamine:</Text> Antimicrobial agent that helps maintain scalp health by preventing microbial growth and creating an optimal environment for hair growth.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Biotin:</Text> Essential B-vitamin that supports healthy hair growth and strengthens hair structure, promoting thicker and more resilient hair.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Salicylic Acid:</Text> Gentle exfoliant that removes dead skin cells and excess sebum from the scalp, preventing clogged hair follicles and promoting healthy hair growth.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Menthol:</Text> Provides a refreshing, cooling sensation that soothes the scalp and stimulates blood circulation for improved nutrient delivery to hair follicles.</Text>
              </>
            ) : product.name === 'HR³ MATRIX HAIR TONIC α' ? (
              <>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Sh-polypeptide-71:</Text> Supports hair follicle health and growth stimulation for stronger, healthier hair.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Copper Tripeptide-1:</Text> Promotes collagen synthesis and hair strength for improved hair quality.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Pentapeptide-20:</Text> Aids in hair growth and follicle nourishment for optimal hair development.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Sophora Japonica Bud Extract:</Text> Antioxidant properties for scalp protection and hair health.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Portulaca Oleracea:</Text> Traditional herb for scalp nourishment and hair strengthening.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Polygonum Multiflorum Root:</Text> Known for hair strengthening properties and scalp health.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Angelica Gigas Root:</Text> Supports scalp health and circulation for better hair growth.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Niacinamide:</Text> Improves blood circulation in the scalp for enhanced nutrient delivery.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Citrus Paradisi Seed Oil:</Text> Provides antimicrobial benefits for scalp health and protection.</Text>
              </>
            ) : product.name === 'HR³ MATRIX MESOPECIA KIT' ? (
              <>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Sh-polypeptide-71:</Text> Supports hair follicle health and growth stimulation for stronger, healthier hair.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Copper Tripeptide-1:</Text> Promotes collagen synthesis and hair strength for improved hair quality.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Pentapeptide-20:</Text> Aids in hair growth and follicle nourishment for optimal hair development.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Sophora Japonica Bud Extract:</Text> Antioxidant properties for scalp protection and hair health.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Portulaca Oleracea:</Text> Traditional herb for scalp nourishment and hair strengthening.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Polygonum Multiflorum Root:</Text> Known for hair strengthening properties and scalp health.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Angelica Gigas Root:</Text> Supports scalp health and circulation for better hair growth.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Niacinamide:</Text> Improves blood circulation in the scalp for enhanced nutrient delivery.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Citrus Paradisi Seed Oil:</Text> Provides antimicrobial benefits for scalp health and protection.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>5α-Reductase Inhibitors:</Text> Suppress DHT conversion to prevent hair loss and promote healthy hair growth.</Text>
              </>
            ) : isCollagenMask ? (
              <>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Hydrolyzed Collagen:</Text> Protein that supports skin structure and improves firmness.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Hyaluronic Acid:</Text> Powerful humectant that attracts and retains moisture.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Vitamin E:</Text> Antioxidant that protects skin from environmental damage.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Seaweed Extract:</Text> Rich in minerals and vitamins for skin nourishment.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Argan Oil:</Text> Moisturizes and softens skin with essential fatty acids.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Shea Butter:</Text> Natural emollient that soothes and hydrates skin.</Text>
              </>
            ) : product.name === 'MICROBIOME ENERGY INFUSING MIST' ? (
              <>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>CUREBIOME (Probiotics & Prebiotics):</Text> Advanced microbiome technology that corrects skin microbiome balance and promotes healthy skin flora.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>FENSEBIOME™ (Acetyl Heptapeptide-4):</Text> Innovative peptide that enhances skin's natural defense mechanisms and microbiome health.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Hyaluronan 10 Multi-Complex:</Text> Multi-molecular hyaluronic acid complex that provides deep hydration and plumping effects.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Butyrospermum Parkii (Shea) Butter:</Text> Natural emollient that provides additional moisture and helps maintain skin's natural barrier.</Text>
              </>
            ) : product.name === 'MOISTURE REPLENISHING HYALURON CREAM' ? (
              <>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Hyaluronan 11 Multi-Complex:</Text> Advanced hyaluronic acid complex with low, middle, and high molecular weights for comprehensive skin hydration and protection.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Mushroom Extracts:</Text> Various mushroom extracts provide powerful anti-inflammatory and antioxidant properties for skin nourishment and protection.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Moisture Magnet Technology:</Text> Special ingredients that attract and retain moisture, creating a moisture reservoir in the skin for sustained hydration.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Natural Cooling Agents:</Text> Natural-origin cooling agents provide instant skin refreshment and help lower skin temperature for a refreshing sensation.</Text>
              </>
            ) : product.name === 'INTENSIVE PROBLEM CONTROL CREAM' ? (
              <>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Zinc PCA:</Text> A powerful sebum-regulating ingredient that helps control oil production and has antimicrobial properties to prevent breakouts and maintain clear skin.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Panthenol (Vitamin B5):</Text> Provides deep hydration and has anti-inflammatory properties that help soothe irritated skin while promoting healing and skin barrier function.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Beta-Glucan:</Text> A natural immune-boosting ingredient that helps strengthen the skin's defense mechanisms, reduce inflammation, and promote healing.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Allantoin:</Text> A gentle, soothing ingredient that helps calm irritated skin, reduce redness, and promote skin healing while being suitable for sensitive skin.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Lactobacillus/Pumpkin Ferment Extract:</Text> A probiotic ingredient that helps balance the skin's microbiome, providing natural antimicrobial benefits and supporting healthy skin flora.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Trehalose:</Text> A natural sugar that acts as a humectant, helping to retain moisture and protect the skin from environmental stressors while maintaining skin hydration.</Text>
              </>
            ) : product.name === 'MOISTURE REPLENISHING HYALURON SERUM' ? (
              <>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Coconut Water Complex (78%):</Text> Natural coconut water provides electrolytes, vitamins, and minerals for optimal skin hydration and balance.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Hyaluronan 11 Multi-Complex:</Text> Advanced hyaluronic acid complex with multiple molecular weights for comprehensive hydration at all skin levels.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Glyceryl Glucoside:</Text> Aquaporin-stimulating ingredient that enhances moisture transport and improves skin's natural hydration mechanisms.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Mushroom Extracts:</Text> Powerful mushroom extracts provide anti-inflammatory, antioxidant, and protective benefits for healthy skin.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Moisture Magnet Technology:</Text> Advanced ingredients that attract and retain moisture for long-lasting hydration and skin comfort.</Text>
              </>
            ) : product.name === 'MULTI SUN CREAM [SPF 40 PA++]' ? (
              <>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Palmitoyl Pentapeptide-4:</Text> Advanced peptide that helps repair and protect skin from environmental damage while promoting healing.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Sodium Hyaluronate:</Text> Deep hydrating ingredient that attracts and retains moisture for plump, hydrated skin.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Botanical Callus Culture Extracts:</Text> Rosa Damascena and Vitis Vinifera extracts provide antioxidant protection and skin nourishment.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Centella Asiatica Extract:</Text> Soothing and healing ingredient that calms irritated skin and promotes skin repair.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Scutellaria Baicalensis Root Extract:</Text> Powerful antioxidant that protects skin from free radical damage and environmental stress.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Lactobacillus/Soymilk Ferment Filtrate:</Text> Probiotic ingredient that supports skin's natural barrier function and overall skin health.</Text>
              </>
            ) : product.name === 'MULTI FUNCTIONAL ANTI-WRINKLE SERUM' ? (
              <>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Bakuchiol:</Text> Natural plant-derived alternative to retinol that provides anti-aging benefits without irritation or photosensitivity.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Anti-aging Peptide 6:</Text> Advanced peptide that targets specific aging mechanisms for comprehensive anti-wrinkle benefits.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Lipid Barrier Liposome:</Text> Ceramide NP, cholesterol, and phytosphingosine create a protective barrier while enhancing ingredient penetration.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Collagen & Elastin:</Text> Essential proteins that support skin structure and elasticity for firm, youthful skin.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Propolis Extract:</Text> Natural bee-derived ingredient that provides antioxidant protection and skin healing benefits.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Adenosine & Niacinamide:</Text> Powerful combination that improves skin texture, reduces fine lines, and enhances skin barrier function.</Text>
              </>
            ) : product.name === 'MULTI FUNCTIONAL ANTI-WRINKLE CREAM' ? (
              <>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Bakuchiol:</Text> A natural alternative to retinol, known for its powerful anti-aging properties. It helps reduce fine lines and wrinkles while being gentle on sensitive skin.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Collagen & Elastin:</Text> Essential proteins that support skin structure and elasticity, helping to maintain firmness and prevent sagging for a more youthful appearance.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Adenosine:</Text> A powerful anti-aging ingredient that aids in reducing wrinkles and improving skin smoothness while promoting cellular renewal.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Propolis Extract:</Text> Offers exceptional anti-inflammatory and antioxidant benefits, helping to protect the skin from environmental damage while soothing irritation.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Mango Seed Butter:</Text> Provides deep hydration and nourishment, creating a protective barrier that helps retain moisture and keep skin soft and supple.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Niacinamide:</Text> Brightens the skin and improves tone while helping to minimize the appearance of pores and fine lines for a more even complexion.</Text>
                <Text style={styles.ingredientItem}><Text style={styles.ingredientLabel}>Ceramide NP, Phytosphingosine, Cholesterol:</Text> These essential lipids strengthen the skin barrier and retain moisture, helping to prevent moisture loss and maintain healthy, resilient skin.</Text>
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
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to Use</Text>
          <View style={styles.usageList}>
            {product.name === 'INTENSIVE HYDRO SOOTHING CREAM' ? (
              <>
                <Text style={styles.usageItem}>1. <Text style={styles.usageLabel}>Preparation:</Text> Cleanse your skin thoroughly before application</Text>
                <Text style={styles.usageItem}>2. <Text style={styles.usageLabel}>Application:</Text> Apply a generous amount to the face and neck area</Text>
                <Text style={styles.usageItem}>3. <Text style={styles.usageLabel}>Massage:</Text> Gently massage in circular motions until fully absorbed</Text>
                <Text style={styles.usageItem}>4. <Text style={styles.usageLabel}>Frequency:</Text> Use morning and evening for optimal results</Text>
                <Text style={styles.usageItem}>5. <Text style={styles.usageLabel}>Professional Use:</Text> Can be used as a treatment mask for enhanced benefits</Text>
              </>
            ) : product.name === 'INTENSIVE BLEMISH BALM CREAM [SPF 30 PA++]' ? (
              <>
                <Text style={styles.usageItem}>1. <Text style={styles.usageLabel}>Preparation:</Text> Cleanse and moisturize your skin before application</Text>
                <Text style={styles.usageItem}>2. <Text style={styles.usageLabel}>Application:</Text> Apply a small amount to areas needing coverage and blend gently</Text>
                <Text style={styles.usageItem}>3. <Text style={styles.usageLabel}>Blending:</Text> Use fingertips or a beauty sponge to blend for natural-looking coverage</Text>
                <Text style={styles.usageItem}>4. <Text style={styles.usageLabel}>Build Coverage:</Text> Layer for additional coverage on areas with more significant blemishes</Text>
                <Text style={styles.usageItem}>5. <Text style={styles.usageLabel}>Setting:</Text> Allow to set for a few minutes before applying additional makeup if desired</Text>
              </>
            ) : product.name === 'INTENSIVE PROBLEM CONTROL CREAM' ? (
              <>
                <Text style={styles.usageItem}>1. <Text style={styles.usageLabel}>Preparation:</Text> Cleanse your skin thoroughly before application</Text>
                <Text style={styles.usageItem}>2. <Text style={styles.usageLabel}>Application:</Text> Apply a small amount to cleansed skin twice daily</Text>
                <Text style={styles.usageItem}>3. <Text style={styles.usageLabel}>Massage:</Text> Gently massage into the skin until fully absorbed</Text>
                <Text style={styles.usageItem}>4. <Text style={styles.usageLabel}>Frequency:</Text> Use as part of your morning and evening skincare routine for best results</Text>
                <Text style={styles.usageItem}>5. <Text style={styles.usageLabel}>Target Areas:</Text> Focus on problematic areas and areas prone to breakouts</Text>
              </>
            ) : product.name === 'INTENSIVE PROBLEM CONTROL TONER' ? (
              <>
                <Text style={styles.usageItem}>1. <Text style={styles.usageLabel}>Daily Cleansing:</Text> Soak a cotton pad with toner and gently wipe along the skin texture to remove dead skin cells and residues after washing the face</Text>
                <Text style={styles.usageItem}>2. <Text style={styles.usageLabel}>Intensive Treatment:</Text> Soak cotton pads with toner and apply them to the face. Leave them on for 5-10 minutes to enhance pore contraction effect and soothe the skin</Text>
                <Text style={styles.usageItem}>3. <Text style={styles.usageLabel}>Application:</Text> Use morning and evening as part of your skincare routine</Text>
                <Text style={styles.usageItem}>4. <Text style={styles.usageLabel}>Target Areas:</Text> Focus on problematic areas, T-zone, and areas prone to breakouts</Text>
                <Text style={styles.usageItem}>5. <Text style={styles.usageLabel}>Follow-up:</Text> Follow with appropriate moisturizer for best results</Text>
              </>
            ) : product.name === 'ALL FOR SENSITIVE SERUM' ? (
              <>
                <Text style={styles.usageItem}>1. <Text style={styles.usageLabel}>Preparation:</Text> Cleanse your skin thoroughly with a gentle cleanser</Text>
                <Text style={styles.usageItem}>2. <Text style={styles.usageLabel}>Application:</Text> Apply the serum to clean skin in the morning and evening</Text>
                <Text style={styles.usageItem}>3. <Text style={styles.usageLabel}>Technique:</Text> Gently pat with fingers until fully absorbed</Text>
                <Text style={styles.usageItem}>4. <Text style={styles.usageLabel}>Frequency:</Text> Use as part of your daily skincare routine for sensitive skin care</Text>
              </>
            ) : product.name === 'EyeCell EYE CONTOUR CREAM' ? (
              <>
                <Text style={styles.usageItem}>1. <Text style={styles.usageLabel}>Preparation:</Text> Apply the cream to pre-cleansed skin around the eyes in the morning and evening</Text>
                <Text style={styles.usageItem}>2. <Text style={styles.usageLabel}>Application:</Text> Gently pat the product around the eye contour area using your ring finger for optimal absorption</Text>
                <Text style={styles.usageItem}>3. <Text style={styles.usageLabel}>Best Results:</Text> For best results, use in conjunction with other Genosys EyeCell products</Text>
              </>
            ) : product.name === 'EyeCell EYE CONTOUR SERUM' ? (
              <>
                <Text style={styles.usageItem}>1. <Text style={styles.usageLabel}>Preparation:</Text> Cleanse your skin thoroughly and ensure the eye area is clean and dry</Text>
                <Text style={styles.usageItem}>2. <Text style={styles.usageLabel}>Application:</Text> Apply a small amount around the eye area in the morning and evening</Text>
                <Text style={styles.usageItem}>3. <Text style={styles.usageLabel}>Technique:</Text> Gently massage until fully absorbed using your ring finger for optimal absorption</Text>
                <Text style={styles.usageItem}>4. <Text style={styles.usageLabel}>Best Results:</Text> For best results, use in conjunction with the Genosys EyeCell Eye Contour Cream as part of your daily eye care routine</Text>
              </>
            ) : product.name === 'EyeCell EYE PEPTIDE GEL PATCH' ? (
              <>
                <Text style={styles.usageItem}>1. <Text style={styles.usageLabel}>Preparation:</Text> Cleanse the face thoroughly</Text>
                <Text style={styles.usageItem}>2. <Text style={styles.usageLabel}>Application:</Text> Apply 2 patches under the eyes, ensuring good contact with the skin</Text>
                <Text style={styles.usageItem}>3. <Text style={styles.usageLabel}>Duration:</Text> Leave on for 20-40 minutes, then remove and discard the patches</Text>
                <Text style={styles.usageItem}>4. <Text style={styles.usageLabel}>Intensive Treatment:</Text> For more intensive treatment effect, apply 4 patches (2 under eyes, 2 on eyebrow area)</Text>
                <Text style={styles.usageItem}>5. <Text style={styles.usageLabel}>Storage:</Text> After use, close the lid and cap securely and keep it completely sealed</Text>
                <Text style={styles.usageItem}>6. <Text style={styles.usageLabel}>Best Results:</Text> For optimal results, use regularly as part of your skincare routine</Text>
              </>
            ) : product.name === 'EyeCell EYE ZONE CARE KIT' ? (
              <>
                <Text style={styles.usageItem}>1. <Text style={styles.usageLabel}>Cleansing:</Text> Begin by thoroughly cleansing the face and eye area</Text>
                <Text style={styles.usageItem}>2. <Text style={styles.usageLabel}>Serum Application:</Text> Apply the Eye Contour Serum gently around the eyes</Text>
                <Text style={styles.usageItem}>3. <Text style={styles.usageLabel}>Micro-Needling:</Text> Use the Eye Roller Dermaroller over the serum-treated area for approximately 2 minutes, avoiding excessive pressure</Text>
                <Text style={styles.usageItem}>4. <Text style={styles.usageLabel}>Patch Application:</Text> Place the Eye Peptide Gel Patches under the eyes and leave them on for 20-40 minutes</Text>
                <Text style={styles.usageItem}>5. <Text style={styles.usageLabel}>Cream Application:</Text> Finish by applying the Eye Contour Cream to the treated area</Text>
              </>
            ) : product.name === 'GENO-LED IR II' ? (
              <>
                <Text style={styles.usageItem}>1. <Text style={styles.usageLabel}>Preparation:</Text> Cleanse your skin thoroughly and ensure the device is fully charged</Text>
                <Text style={styles.usageItem}>2. <Text style={styles.usageLabel}>Positioning:</Text> Hold the device 1-2 inches away from your skin and turn it on</Text>
                <Text style={styles.usageItem}>3. <Text style={styles.usageLabel}>Treatment:</Text> Move the device slowly across the treatment area for 10-20 minutes per session</Text>
                <Text style={styles.usageItem}>4. <Text style={styles.usageLabel}>Frequency:</Text> Use 3-5 times per week for optimal results</Text>
                <Text style={styles.usageItem}>5. <Text style={styles.usageLabel}>Safety:</Text> Avoid direct eye contact and follow the built-in timer controls</Text>
                <Text style={styles.usageItem}>6. <Text style={styles.usageLabel}>Maintenance:</Text> Clean the device after each use and store in a cool, dry place</Text>
              </>
            ) : product.name === 'SKIN REBOOT PDRN MASK PACK' ? (
              <>
                <Text style={styles.usageItem}>1. <Text style={styles.usageLabel}>Prepare:</Text> Cleanse your face and pat dry</Text>
                <Text style={styles.usageItem}>2. <Text style={styles.usageLabel}>Extract:</Text> Take out one sheet mask with the built-in tweezers</Text>
                <Text style={styles.usageItem}>3. <Text style={styles.usageLabel}>Apply:</Text> Apply the mask closely to the face, smoothing out any air bubbles</Text>
                <Text style={styles.usageItem}>4. <Text style={styles.usageLabel}>Wait:</Text> Leave on for 10-15 minutes to allow active ingredients to absorb</Text>
                <Text style={styles.usageItem}>5. <Text style={styles.usageLabel}>Remove:</Text> Remove the mask sheet and gently pat the remaining essence into your skin</Text>
                <Text style={styles.usageItem}>6. <Text style={styles.usageLabel}>Store:</Text> Close the closure seal and cap tightly to prevent the product from drying out</Text>
              </>
            ) : product.name === 'BIO-FERMENT AGE DEFYING POWDER MASK' ? (
              <>
                <Text style={styles.usageItem}>1. <Text style={styles.usageLabel}>Preparation:</Text> Cleanse your skin thoroughly and apply toner if desired</Text>
                <Text style={styles.usageItem}>2. <Text style={styles.usageLabel}>Mixing:</Text> Mix the powder with water or your preferred liquid to create a smooth paste</Text>
                <Text style={styles.usageItem}>3. <Text style={styles.usageLabel}>Application:</Text> Apply evenly to clean skin, avoiding the eye area</Text>
                <Text style={styles.usageItem}>4. <Text style={styles.usageLabel}>Duration:</Text> Leave on for 15-20 minutes</Text>
                <Text style={styles.usageItem}>5. <Text style={styles.usageLabel}>Removal:</Text> Rinse thoroughly with lukewarm water</Text>
                <Text style={styles.usageItem}>6. <Text style={styles.usageLabel}>Frequency:</Text> Use 1-2 times per week for optimal results</Text>
              </>
            ) : product.name === 'EGF REPAIR OXYMASK CREAM' ? (
              <>
                <Text style={styles.usageItem}>1. <Text style={styles.usageLabel}>Preparation:</Text> Cleanse your skin thoroughly and ensure skin is dry</Text>
                <Text style={styles.usageItem}>2. <Text style={styles.usageLabel}>Application:</Text> Apply a thin layer of the cream mask evenly on dry skin</Text>
                <Text style={styles.usageItem}>3. <Text style={styles.usageLabel}>Bubbling Process:</Text> Do not rub; wait for the oxygen bubbles to form and cover the face</Text>
                <Text style={styles.usageItem}>4. <Text style={styles.usageLabel}>Massage:</Text> Once the bubbles start popping (after 1-2 minutes), gently massage and tap for better absorption</Text>
                <Text style={styles.usageItem}>5. <Text style={styles.usageLabel}>Completion:</Text> Do not rinse off</Text>
                <Text style={styles.usageItem}>6. <Text style={styles.usageLabel}>Frequency:</Text> Use in the morning and evening</Text>
              </>
            ) : product.name === 'EPI TURNOVER BOOSTING PEELING GEL' ? (
              <>
                <Text style={styles.usageItem}>1. <Text style={styles.usageLabel}>Preparation:</Text> Cleanse your skin thoroughly and ensure skin is dry</Text>
                <Text style={styles.usageItem}>2. <Text style={styles.usageLabel}>Application:</Text> Apply the gel to clean, dry skin</Text>
                <Text style={styles.usageItem}>3. <Text style={styles.usageLabel}>Massage:</Text> Gently massage in a circular motion for up to one minute</Text>
                <Text style={styles.usageItem}>4. <Text style={styles.usageLabel}>Removal:</Text> Rinse off the clumped dead skin cells with lukewarm water</Text>
                <Text style={styles.usageItem}>5. <Text style={styles.usageLabel}>Frequency:</Text> Use 1-2 times per week for optimal results</Text>
              </>
            ) : product.name === 'EZ CO₂ MASK KIT' ? (
              <>
                <Text style={styles.usageItem}>1. <Text style={styles.usageLabel}>Preparation:</Text> Cleanse your skin thoroughly and ensure skin is dry</Text>
                <Text style={styles.usageItem}>2. <Text style={styles.usageLabel}>Gel Application:</Text> Apply the CO₂ gel evenly to clean skin</Text>
                <Text style={styles.usageItem}>3. <Text style={styles.usageLabel}>Mask Placement:</Text> Place the sheet mask over the treated area</Text>
                <Text style={styles.usageItem}>4. <Text style={styles.usageLabel}>Duration:</Text> Leave on for 15-20 minutes to allow the CO₂ therapy to work</Text>
                <Text style={styles.usageItem}>5. <Text style={styles.usageLabel}>Removal:</Text> Remove mask and gently massage any remaining product into the skin</Text>
                <Text style={styles.usageItem}>6. <Text style={styles.usageLabel}>Frequency:</Text> Use 1-2 times per week for optimal results</Text>
              </>
            ) : product.name === 'INTENSIVE BLEMISH BALM CREAM [SPF 30 PA++]' ? (
              <>
                <Text style={styles.usageItem}>1. <Text style={styles.usageLabel}>Preparation:</Text> Cleanse and moisturize your skin before application</Text>
                <Text style={styles.usageItem}>2. <Text style={styles.usageLabel}>Application:</Text> Apply a small amount to areas needing coverage and blend gently</Text>
                <Text style={styles.usageItem}>3. <Text style={styles.usageLabel}>Blending:</Text> Use fingertips or a beauty sponge to blend for natural-looking coverage</Text>
                <Text style={styles.usageItem}>4. <Text style={styles.usageLabel}>Build Coverage:</Text> Layer for additional coverage on areas with more significant blemishes</Text>
                <Text style={styles.usageItem}>5. <Text style={styles.usageLabel}>Setting:</Text> Allow to set for a few minutes before applying additional makeup if desired</Text>
              </>
            ) : product.name === 'HR³ MATRIX HAIR TONIC α' ? (
              <>
                <Text style={styles.usageItem}>1. <Text style={styles.usageLabel}>Preparation:</Text> Cleanse scalp thoroughly with HR³ MATRIX SCALP PEELING</Text>
                <Text style={styles.usageItem}>2. <Text style={styles.usageLabel}>Application:</Text> Apply the tonic evenly to the scalp and hair roots</Text>
                <Text style={styles.usageItem}>3. <Text style={styles.usageLabel}>Massage:</Text> Gently massage into scalp for 2-3 minutes to enhance absorption</Text>
                <Text style={styles.usageItem}>4. <Text style={styles.usageLabel}>Enhancement:</Text> Use with GENOSYS STAMP (ROLLER) for deeper penetration</Text>
                <Text style={styles.usageItem}>5. <Text style={styles.usageLabel}>Frequency:</Text> Use 2-3 times per week for optimal results</Text>
              </>
            ) : product.name === 'HR³ MATRIX SCALP PEELING α' ? (
              <>
                <Text style={styles.usageItem}>1. <Text style={styles.usageLabel}>Scalp Preparation:</Text> Ensure the scalp is clean and dry before application</Text>
                <Text style={styles.usageItem}>2. <Text style={styles.usageLabel}>Application:</Text> Apply a small amount of the peeling solution to the scalp</Text>
                <Text style={styles.usageItem}>3. <Text style={styles.usageLabel}>Massage:</Text> Gently massage the solution into the scalp using circular motions</Text>
                <Text style={styles.usageItem}>4. <Text style={styles.usageLabel}>Processing Time:</Text> Allow the solution to work for 2-3 minutes</Text>
                <Text style={styles.usageItem}>5. <Text style={styles.usageLabel}>Rinse:</Text> Thoroughly rinse with lukewarm water</Text>
                <Text style={styles.usageItem}>6. <Text style={styles.usageLabel}>Follow-up:</Text> Proceed with your regular microneedling treatment protocol</Text>
              </>
            ) : product.name === 'HR³ MATRIX SCALP SHAMPOO α' ? (
              <>
                <Text style={styles.usageItem}>1. <Text style={styles.usageLabel}>Wet Hair:</Text> Thoroughly wet your hair with lukewarm water</Text>
                <Text style={styles.usageItem}>2. <Text style={styles.usageLabel}>Apply Shampoo:</Text> Take an appropriate amount and massage gently into scalp</Text>
                <Text style={styles.usageItem}>3. <Text style={styles.usageLabel}>Massage:</Text> Use fingertips to massage scalp for 2-3 minutes</Text>
                <Text style={styles.usageItem}>4. <Text style={styles.usageLabel}>Rinse:</Text> Rinse thoroughly with lukewarm water</Text>
                <Text style={styles.usageItem}>5. <Text style={styles.usageLabel}>Repeat if Needed:</Text> For best results, use twice weekly or as recommended</Text>
                <Text style={styles.usageItem}>6. <Text style={styles.usageLabel}>Follow-up:</Text> Use in conjunction with HR³ MATRIX treatment protocol</Text>
              </>
            ) : product.name === 'HYDRO COOL MODELING MASK' ? (
              <>
                <Text style={styles.usageItem}>1. <Text style={styles.usageLabel}>Cleanse:</Text> Begin with thoroughly cleansed facial skin</Text>
                <Text style={styles.usageItem}>2. <Text style={styles.usageLabel}>Application:</Text> Apply the modeling mask evenly to the face</Text>
                <Text style={styles.usageItem}>3. <Text style={styles.usageLabel}>Processing Time:</Text> Leave the mask on for 15-20 minutes</Text>
                <Text style={styles.usageItem}>4. <Text style={styles.usageLabel}>Removal:</Text> Gently rub the residue into the skin for additional benefits</Text>
                <Text style={styles.usageItem}>5. <Text style={styles.usageLabel}>Rinse:</Text> Rinse off any remaining residue with lukewarm water</Text>
                <Text style={styles.usageItem}>6. <Text style={styles.usageLabel}>Follow-up:</Text> Continue with your regular skincare routine</Text>
              </>
            ) : product.name === 'SKIN RESCUE OVERNIGHT CREAM MASK' ? (
              <>
                <Text style={styles.usageItem}>1. <Text style={styles.usageLabel}>Preparation:</Text> Cleanse skin thoroughly and apply toner if desired</Text>
                <Text style={styles.usageItem}>2. <Text style={styles.usageLabel}>Application:</Text> Apply a generous amount to face and neck</Text>
                <Text style={styles.usageItem}>3. <Text style={styles.usageLabel}>Massage:</Text> Gently massage until oxygen capsules burst and blend with cream</Text>
                <Text style={styles.usageItem}>4. <Text style={styles.usageLabel}>Overnight:</Text> Leave on overnight for maximum benefits</Text>
                <Text style={styles.usageItem}>5. <Text style={styles.usageLabel}>Frequency:</Text> Use 2-3 times per week for optimal results</Text>
                <Text style={styles.usageItem}>6. <Text style={styles.usageLabel}>Results:</Text> Wake up to revitalized, refreshed skin</Text>
              </>
            ) : product.name === 'HR³ MATRIX HAIR SOLUTION α' ? (
              <>
                <Text style={styles.usageItem}>1. <Text style={styles.usageLabel}>Preparation:</Text> Cleanse scalp thoroughly with HR³ MATRIX SCALP PEELING</Text>
                <Text style={styles.usageItem}>2. <Text style={styles.usageLabel}>Application:</Text> Apply the solution evenly to the scalp and hair roots</Text>
                <Text style={styles.usageItem}>3. <Text style={styles.usageLabel}>Massage:</Text> Gently massage into scalp for 2-3 minutes to enhance absorption</Text>
                <Text style={styles.usageItem}>4. <Text style={styles.usageLabel}>Enhancement:</Text> Use with GENOSYS STAMP (ROLLER) for deeper penetration</Text>
                <Text style={styles.usageItem}>5. <Text style={styles.usageLabel}>Frequency:</Text> Use 2-3 times per week for optimal results</Text>
              </>
            ) : product.name === 'HR³ MATRIX MESOPECIA KIT' ? (
              <>
                <Text style={styles.usageItem}>1. <Text style={styles.usageLabel}>Scalp Preparation:</Text> Apply HR³ MATRIX SCALP PEELING to cleanse and prepare the scalp</Text>
                <Text style={styles.usageItem}>2. <Text style={styles.usageLabel}>Hair Parting:</Text> Part the hair in the area of hair loss for targeted treatment</Text>
                <Text style={styles.usageItem}>3. <Text style={styles.usageLabel}>Roller Application:</Text> Use GENOSYS STAMP (ROLLER) to gently roll or stamp the scalp</Text>
                <Text style={styles.usageItem}>4. <Text style={styles.usageLabel}>Solution Application:</Text> Apply HR³ MATRIX HAIR SOLUTION using the dropper while rolling</Text>
                <Text style={styles.usageItem}>5. <Text style={styles.usageLabel}>Post-Treatment:</Text> Use HR³ MATRIX Shampoo and Tonic for optimal maintenance</Text>
              </>
            ) : product.name === 'MICROBIOME ENERGY INFUSING MIST' ? (
              <>
                <Text style={styles.usageItem}>1. <Text style={styles.usageLabel}>Preparation:</Text> Cleanse your skin thoroughly before application</Text>
                <Text style={styles.usageItem}>2. <Text style={styles.usageLabel}>Application:</Text> Hold the bottle 15-20cm away from your face and mist evenly</Text>
                <Text style={styles.usageItem}>3. <Text style={styles.usageLabel}>Absorption:</Text> Gently pat the mist into your skin with your fingertips</Text>
                <Text style={styles.usageItem}>4. <Text style={styles.usageLabel}>Frequency:</Text> Use morning and evening, or as needed throughout the day</Text>
                <Text style={styles.usageItem}>5. <Text style={styles.usageLabel}>Layering:</Text> Can be used before or after other skincare products</Text>
              </>
            ) : product.name === 'MOISTURE REPLENISHING HYALURON CREAM' ? (
              <>
                <Text style={styles.usageItem}>1. <Text style={styles.usageLabel}>Cleanse:</Text> Start with clean, dry skin</Text>
                <Text style={styles.usageItem}>2. <Text style={styles.usageLabel}>Apply:</Text> Take a small amount and gently massage onto face and neck</Text>
                <Text style={styles.usageItem}>3. <Text style={styles.usageLabel}>Massage:</Text> Use upward circular motions until fully absorbed</Text>
                <Text style={styles.usageItem}>4. <Text style={styles.usageLabel}>Frequency:</Text> Use morning and evening for best results</Text>
                <Text style={styles.usageItem}>5. <Text style={styles.usageLabel}>Follow-up:</Text> Apply sunscreen during the day</Text>
              </>
            ) : product.name === 'INTENSIVE PROBLEM CONTROL CREAM' ? (
              <>
                <Text style={styles.usageItem}>1. <Text style={styles.usageLabel}>Preparation:</Text> Cleanse skin thoroughly before application</Text>
                <Text style={styles.usageItem}>2. <Text style={styles.usageLabel}>Application:</Text> Apply a small amount to cleansed skin</Text>
                <Text style={styles.usageItem}>3. <Text style={styles.usageLabel}>Massage:</Text> Gently massage into the skin until fully absorbed</Text>
                <Text style={styles.usageItem}>4. <Text style={styles.usageLabel}>Frequency:</Text> Use twice daily as part of your morning and evening skincare routine</Text>
                <Text style={styles.usageItem}>5. <Text style={styles.usageLabel}>Results:</Text> Use consistently for best results in controlling problematic skin</Text>
              </>
            ) : product.name === 'MULTI SUN CREAM [SPF 40 PA++]' ? (
              <>
                <Text style={styles.usageItem}>1. <Text style={styles.usageLabel}>Preparation:</Text> Cleanse your skin thoroughly before application</Text>
                <Text style={styles.usageItem}>2. <Text style={styles.usageLabel}>Application:</Text> Apply generously to face, neck, and exposed areas 15-30 minutes before sun exposure</Text>
                <Text style={styles.usageItem}>3. <Text style={styles.usageLabel}>Reapplication:</Text> Reapply every 2 hours or after swimming, sweating, or towel drying</Text>
                <Text style={styles.usageItem}>4. <Text style={styles.usageLabel}>Daily Use:</Text> Use as the final step in your morning skincare routine</Text>
                <Text style={styles.usageItem}>5. <Text style={styles.usageLabel}>Coverage:</Text> Ensure even coverage for optimal protection</Text>
              </>
            ) : product.name === 'MULTI FUNCTIONAL ANTI-WRINKLE SERUM' ? (
              <>
                <Text style={styles.usageItem}>1. <Text style={styles.usageLabel}>Preparation:</Text> Cleanse skin thoroughly and apply toner if desired</Text>
                <Text style={styles.usageItem}>2. <Text style={styles.usageLabel}>Application:</Text> Apply 2-3 drops to face and neck, avoiding eye area</Text>
                <Text style={styles.usageItem}>3. <Text style={styles.usageLabel}>Massage:</Text> Gently massage in upward motions until fully absorbed</Text>
                <Text style={styles.usageItem}>4. <Text style={styles.usageLabel}>Follow-up:</Text> Apply moisturizer and sunscreen during daytime</Text>
                <Text style={styles.usageItem}>5. <Text style={styles.usageLabel}>Frequency:</Text> Use once daily, preferably in the evening</Text>
                <Text style={styles.usageItem}>6. <Text style={styles.usageLabel}>Results:</Text> Visible improvements typically seen within 4-6 weeks of consistent use</Text>
              </>
            ) : product.name === 'MULTI FUNCTIONAL ANTI-WRINKLE CREAM' ? (
              <>
                <Text style={styles.usageItem}>1. <Text style={styles.usageLabel}>Application:</Text> Apply a thin layer of the cream to the face, neck, and décolleté with gentle patting motions</Text>
                <Text style={styles.usageItem}>2. <Text style={styles.usageLabel}>Timing:</Text> Use in the morning and/or evening for optimal results</Text>
              </>
            ) : product.name === 'MOISTURE REPLENISHING HYALURON SERUM' ? (
              <>
                <Text style={styles.usageItem}>1. <Text style={styles.usageLabel}>Preparation:</Text> Cleanse skin thoroughly and apply toner if desired</Text>
                <Text style={styles.usageItem}>2. <Text style={styles.usageLabel}>Application:</Text> Apply 2-3 drops to face and neck, avoiding eye area</Text>
                <Text style={styles.usageItem}>3. <Text style={styles.usageLabel}>Massage:</Text> Gently massage in upward motions until fully absorbed</Text>
                <Text style={styles.usageItem}>4. <Text style={styles.usageLabel}>Follow-up:</Text> Apply moisturizer to lock in hydration</Text>
                <Text style={styles.usageItem}>5. <Text style={styles.usageLabel}>Frequency:</Text> Use morning and evening for optimal results</Text>
                <Text style={styles.usageItem}>6. <Text style={styles.usageLabel}>Results:</Text> Immediate hydration with long-lasting moisture retention</Text>
              </>
            ) : isCollagenMask ? (
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
            <Text style={styles.noteLabel}>Note:</Text> {product.name === 'ALL FOR SENSITIVE SERUM' 
              ? "This product is dermatologically tested and specifically formulated for sensitive skin. For best results, use as part of your daily sensitive skin care routine."
              : product.name === 'EyeCell EYE CONTOUR CREAM'
              ? "This product is dermatologically tested and safe for all skin types. For optimal results, use in conjunction with other Genosys EyeCell products as part of your daily eye care routine."
              : product.name === 'EyeCell EYE CONTOUR SERUM'
              ? "This product is dermatologically tested and safe for all skin types. For optimal results, use in conjunction with other Genosys EyeCell products as part of your daily eye care routine."
              : product.name === 'EyeCell EYE PEPTIDE GEL PATCH'
              ? "This product is dermatologically tested and safe for all skin types. For best results, use in conjunction with other Genosys EyeCell products as part of your daily eye care regimen."
              : product.name === 'EyeCell EYE ZONE CARE KIT'
              ? "This product is dermatologically tested and safe for all skin types. Regular use can lead to a more youthful, vibrant, and refreshed appearance around the eyes. For best results, use in conjunction with other Genosys EyeCell products as part of your daily eye care regimen."
              : product.name === 'GENO-LED IR II'
              ? "This device is designed for professional and home use. For best results, use consistently as part of your skincare routine. Consult with a skincare professional for personalized treatment protocols."
              : product.name === 'SKIN REBOOT PDRN MASK PACK'
              ? "This product is clinically proven to restore skin barrier function damaged by physical irritation. For optimal results, use consistently 2-3 times per week. Store in a cool, dry place and ensure the container is tightly sealed after each use to maintain product freshness."
              : product.name === 'BIO-FERMENT AGE DEFYING POWDER MASK'
              ? "This product is dermatologically tested and safe for all skin types. For best results, use as part of your weekly skincare routine to achieve youthful, radiant skin."
              : product.name === 'EGF REPAIR OXYMASK CREAM'
              ? "This product is dermatologically tested and suitable for all skin types. For optimal bubbling, avoid rubbing the product during application. For best results, incorporate it into your daily skincare routine."
              : product.name === 'EPI TURNOVER BOOSTING PEELING GEL'
              ? "This product is dermatologically tested and safe for all skin types. For best results, use as part of your weekly skincare routine to achieve smoother, more radiant skin."
              : product.name === 'EZ CO₂ MASK KIT'
              ? "This product is dermatologically tested and safe for all skin types. The CO₂ therapy mechanism accelerates oxygen delivery to skin tissues, providing professional-grade results. For best results, use as part of your weekly skincare routine."
              : product.name === 'SKIN RESCUE OVERNIGHT CREAM MASK'
              ? "This product is dermatologically tested and clinically proven to improve erythema and transepidermal water loss. For best results, use consistently as part of your weekly skincare routine. Store in a cool, dry place away from direct sunlight."
              : product.name === 'HR³ MATRIX HAIR SOLUTION α'
              ? "This product is designed for both professional and home use. For best results, use as part of the complete HR³ MATRIX MESOPECIA KIT system. Consult with a hair care professional for personalized treatment protocols. Store in a cool, dry place away from direct sunlight."
              : product.name === 'HR³ MATRIX MESOPECIA KIT'
              ? "This comprehensive kit is designed for both professional and home use. For best results, follow the complete treatment protocol and use in conjunction with HR³ MATRIX Shampoo and Tonic for optimal hair health maintenance. Store in a cool, dry place away from direct sunlight."
              : product.name === 'HR³ MATRIX HAIR TONIC α'
              ? "This product is designed for both professional and home use. For best results, use as part of the complete HR³ MATRIX MESOPECIA KIT system. Consult with a hair care professional for personalized treatment protocols."
              : product.name === 'HR³ MATRIX SCALP PEELING α'
              ? "This product is designed for use in conjunction with microneedling treatments. For best results, use as part of the complete HR³ MATRIX treatment protocol. Avoid contact with eyes and discontinue use if irritation occurs."
              : product.name === 'HR³ MATRIX SCALP SHAMPOO α'
              ? "This product is KFDA approved as a functional product for improving hair loss symptoms. For best results, use as part of the complete HR³ MATRIX treatment protocol. Regular use helps maintain optimal scalp health and promotes healthy hair growth."
              : product.name === 'Hair-GENTRON'
              ? "This device is designed for professional and home use. For best results, use consistently as part of your hair care routine. Consult with a hair care professional for personalized treatment protocols."
              : product.name === 'INTENSIVE HYDRO SOOTHING CREAM'
              ? "This product is dermatologically tested and safe for all skin types. Perfect for daily use and post-treatment care. For best results, use as part of your daily skincare routine and reapply as needed for additional hydration."
              : product.name === 'INTENSIVE BLEMISH BALM CREAM [SPF 30 PA++]'
              ? "This product is dermatologically tested and safe for all skin types. Perfect for daily use and post-treatment care. For best results, use as part of your daily skincare routine and reapply as needed throughout the day."
              : product.name === 'INTENSIVE PROBLEM CONTROL CREAM'
              ? "This product is dermatologically tested and safe for all skin types. Perfect for daily use and post-treatment care. For best results, use as part of your daily skincare routine and reapply as needed throughout the day."
              : product.name === 'INTENSIVE PROBLEM CONTROL TONER'
              ? "This product is dermatologically tested and safe for all skin types. Particularly effective for problematic and acne-prone skin. For best results, use as part of your daily skincare routine and follow with appropriate moisturizer."
              : product.name === 'HairGen BOOSTER'
              ? "This device is designed for professional and home use. For best results, use consistently as part of your hair care routine. Consult with a hair care professional for personalized treatment protocols."
              : product.name === 'HYDRO COOL MODELING MASK'
              ? "This product is dermatologically tested and safe for all skin types. Particularly beneficial after professional skin treatments. For best results, use as part of your regular skincare routine to maintain optimal skin health and comfort."
              : product.name === 'MOISTURE REPLENISHING HYALURON SERUM'
              ? "This advanced hydration serum uses a 4-step hydration system to provide comprehensive moisture delivery and retention. The coconut water base provides natural electrolytes for optimal skin balance, while the multi-molecular hyaluronic acid complex ensures deep penetration and surface protection. For best results, use consistently as part of your daily skincare routine."
              : product.name === 'MULTI SUN CREAM [SPF 40 PA++]'
              ? "This product is dermatologically tested and safe for all skin types. For best results, apply generously and reapply as needed. Perfect for daily use and outdoor activities. Store in a cool, dry place away from direct sunlight."
              : product.name === 'MULTI FUNCTIONAL ANTI-WRINKLE SERUM'
              ? "This product is dermatologically tested and clinically proven. For best results, use consistently as part of your daily skincare routine. Suitable for all skin types, including sensitive skin. Store in a cool, dry place away from direct sunlight."
              : product.name === 'MULTI FUNCTIONAL ANTI-WRINKLE CREAM'
              ? "This product is dermatologically tested and safe for all skin types. For best results, use as part of your daily skincare routine to achieve youthful, radiant skin."
              : "This product is dermatologically tested and clinically proven for professional skincare results. For best results, use consistently as part of your daily skincare routine. Store in a cool, dry place away from direct sunlight. If irritation occurs, discontinue use and consult a dermatologist."
            }
          </Text>
        </View>

        {/* Product Documentation Section */}
        {(product.name === 'BIO-FERMENT AGE DEFYING POWDER MASK' || product.name === 'EZ CO₂ MASK KIT' || product.name === 'EyeCell EYE PEPTIDE GEL PATCH' || product.name === 'EyeCell EYE ZONE CARE KIT' || product.name === 'GENO-LED IR II' || product.name === 'SKIN REBOOT PDRN MASK PACK' || product.name === 'SKIN RESCUE OVERNIGHT CREAM MASK' || product.name === 'HR³ MATRIX HAIR SOLUTION α' || product.name === 'HR³ MATRIX MESOPECIA KIT' || product.name === 'HR³ MATRIX HAIR TONIC α' || product.name === 'HR³ MATRIX SCALP PEELING α' || product.name === 'HR³ MATRIX SCALP SHAMPOO α' || product.name === 'Hair-GENTRON' || product.name === 'INTENSIVE PROBLEM CONTROL TONER' || product.name === 'MICROBIOME ENERGY INFUSING MIST' || product.name === 'MOISTURE REPLENISHING HYALURON CREAM' || product.name === 'MOISTURE REPLENISHING HYALURON SERUM') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Documentation</Text>
            <View style={styles.documentationBlock}>
              <Text style={styles.documentationText}>
                Download the complete product manual and usage guide for professional application.
              </Text>
              <View style={styles.documentationInfo}>
                <Text style={styles.documentationFileInfo}>📄 File size: {product.name === 'BIO-FERMENT AGE DEFYING POWDER MASK' ? '2.1 MB' : product.name === 'EZ CO₂ MASK KIT' ? '2.8 MB' : product.name === 'EyeCell EYE ZONE CARE KIT' ? '1.5 MB' : product.name === 'GENO-LED IR II' ? '4.6 MB' : product.name === 'SKIN REBOOT PDRN MASK PACK' ? '1.8 MB' : product.name === 'SKIN RESCUE OVERNIGHT CREAM MASK' ? '1.0 MB' : product.name === 'HR³ MATRIX HAIR SOLUTION α' ? '1.1 MB' : product.name === 'HR³ MATRIX MESOPECIA KIT' ? '1.2 MB' : product.name === 'HR³ MATRIX HAIR TONIC α' ? '650 KB' : product.name === 'HR³ MATRIX SCALP PEELING α' ? '900 KB' : product.name === 'HR³ MATRIX SCALP SHAMPOO α' ? '800 KB' : product.name === 'Hair-GENTRON' ? '650 KB' : product.name === 'INTENSIVE PROBLEM CONTROL TONER' ? '750 KB' : product.name === 'MICROBIOME ENERGY INFUSING MIST' ? '1.0 MB' : product.name === 'MOISTURE REPLENISHING HYALURON CREAM' ? '1.4 MB' : product.name === 'MOISTURE REPLENISHING HYALURON SERUM' ? '1.3 MB' : '850 KB'}</Text>
              </View>
            <TouchableOpacity
                style={styles.documentationButton}
                onPress={() => {
                  // Open the product documentation PDF
                  const pdfUrl = product.name === 'BIO-FERMENT AGE DEFYING POWDER MASK'
                    ? 'https://genosys.ae/documents/ppt/GENOSYS%20BIO-FERMENT%20AGE%20DEFYING%20POWDER%20MASK.pdf'
                    : product.name === 'EZ CO₂ MASK KIT'
                    ? 'https://genosys.ae/documents/ppt/Genosys%20Ez%20Co2%20Mask.pdf'
                    : product.name === 'EyeCell EYE ZONE CARE KIT'
                    ? 'https://genosys.ae/documents/ppt/GENOSYS%20EyeCell%20EYE%20ZONE%20CARE%20SYSTEM.pdf'
                    : product.name === 'GENO-LED IR II'
                    ? 'https://genosys.ae/documents/ppt/GENO-LED%20IR%20II_2025.pdf'
                    : product.name === 'SKIN REBOOT PDRN MASK PACK'
                    ? 'https://genosys.ae/documents/ppt/GENOSYS%20SKIN%20REBOOT%20PDRN%20MASK%20PACK.pdf'
                    : product.name === 'SKIN RESCUE OVERNIGHT CREAM MASK'
                    ? 'https://genosys.ae/documents/ppt/GENOSYS%20SKIN%20RESCUE%20OVERNIGHT%20CREAM%20MASK.pdf'
                    : product.name === 'HR³ MATRIX HAIR SOLUTION α'
                    ? 'https://genosys.ae/documents/ppt/GENOSYS%20HR3%20MATRIX%20HAIR%20SOLUTION.pdf'
                    : product.name === 'HR³ MATRIX MESOPECIA KIT'
                    ? 'https://genosys.ae/documents/ppt/GENOSYS%20HR3%20MATRIX%20MESOPECIA%20KIT.pdf'
                    : product.name === 'HR³ MATRIX HAIR TONIC α'
                    ? 'https://genosys.ae/documents/ppt/GENOSYS%20HR3%20MATRIX%20HAIR%20TONIC%20ALPHA.pdf'
                    : product.name === 'HR³ MATRIX SCALP PEELING α'
                    ? 'https://genosys.ae/documents/ppt/GENOSYS%20HR3%20MATRIX%20SCALP%20PEELING%20ALPHA.pdf'
                    : product.name === 'HR³ MATRIX SCALP SHAMPOO α'
                    ? 'https://genosys.ae/documents/ppt/GENOSYS%20HR3%20MATRIX%20SCALP%20SHAMPOO%20ALPHA.pdf'
                    : product.name === 'Hair-GENTRON'
                    ? 'https://genosys.ae/documents/ppt/HAIR%20GENTRON.pdf'
                    : product.name === 'INTENSIVE PROBLEM CONTROL TONER'
                    ? 'https://genosys.ae/documents/ppt/GENOSYS%20INTENSIVE%20PROBLEM%20CONTROL%20TONER.pdf'
                    : product.name === 'MICROBIOME ENERGY INFUSING MIST'
                    ? 'https://genosys.ae/documents/ppt/GENOSYS%20MICROBIOME%20ENERGY%20INFUSING%20MIST.pdf'
                    : product.name === 'MOISTURE REPLENISHING HYALURON CREAM'
                    ? 'https://genosys.ae/documents/ppt/GENOSYS%20MOISTURE%20REPLENISHING%20HYALURON%20CREAM.pdf'
                    : product.name === 'MOISTURE REPLENISHING HYALURON SERUM'
                    ? 'https://genosys.ae/documents/ppt/GENOSYS%20MOISTURE%20REPLENISHING%20HYALURON%20SERUM.pdf'
                    : 'https://genosys.ae/documents/ppt/GENOSYS%20EyeCell%20EYE%20PEPTIDE%20GEL%20PATCH.pdf';
                  Linking.openURL(pdfUrl);
                }}
              >
                <Text style={styles.documentationButtonText}>View PDF</Text>
            </TouchableOpacity>
          </View>
        </View>
        )}

        {/* Shipping Info */}
        <View style={styles.shippingInfo}>
          <Text style={styles.shippingTitle}>Shipping Information</Text>
          <Text style={styles.shippingItem}>🚚 Free Shipping on orders over 1,000 AED</Text>
          <Text style={styles.shippingItem}>💳 Secure Payment with Stripe checkout</Text>
          <Text style={styles.shippingItem}>🏛️ 5% UAE Tax Payer - Supporting local economy</Text>
        </View>

        {/* Footer Section */}
        <View style={styles.footerSection}>
          <Image 
            source={{ uri: 'https://genosys.ae/_next/image?url=%2Fimages%2FFull.avif%3Fv%3D1760037369129&w=640&q=75' }}
            style={styles.footerLogo}
            resizeMode="contain"
          />
          <Text style={styles.footerCompanyName}>Genosys Middle East FZ-LLC</Text>
          <Text style={styles.footerDescription}>Official Distributor in the UAE</Text>
          <Text style={styles.footerCopyright}>© 2025 Genosys Middle East FZ-LLC. All rights reserved.</Text>
        </View>
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
  inStockBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  inStockText: {
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
  descriptionBlock: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    flexWrap: 'wrap',
    flexShrink: 1,
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
  documentationText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    marginBottom: 8,
  },
  documentationInfo: {
    marginBottom: 12,
  },
  documentationFileInfo: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  documentationButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentationButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  documentationBlock: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  footerSection: {
    backgroundColor: '#ffffff',
    padding: 24,
    marginTop: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerLogo: {
    width: 120,
    height: 60,
    marginBottom: 16,
  },
  footerCompanyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  footerDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    textAlign: 'center',
  },
  footerCopyright: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
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
