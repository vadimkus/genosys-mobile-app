import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useTheme } from '../../contexts/ThemeContext';
import { Product } from '../../types';
import { useProductDetail } from '../../hooks/useProductDetail';
import { ProductHeader } from '../../components/ProductHeader';
import { ProductImage } from '../../components/ProductImage';
import { ProductPricing } from '../../components/ProductPricing';
import { ProductDetails } from '../../components/ProductDetails';
import { ProductActions } from '../../components/ProductActions';
import { OptimizedImage } from '../../components/OptimizedImage';
import { trackScreenLoad } from '../../utils/performance';

type ProductDetailScreenNavigationProp =
  StackNavigationProp<RootStackParamList>;

// Helper functions for color selection
const getColorSwatch = (color: string): string => {
  switch (color) {
    case 'Beige':
      return '#D2B48C';
    case 'Ivory':
      return '#FFFFF0';
    case 'Camel':
      return '#C19A6B';
    default:
      return '#CCCCCC';
  }
};

const getColorDescription = (color: string): string => {
  switch (color) {
    case 'Beige':
      return 'Fitzpatrick 2-4';
    case 'Ivory':
      return 'Fitzpatrick 1-2';
    case 'Camel':
      return 'Fitzpatrick 4-6';
    default:
      return '';
  }
};

export default function ProductDetailScreenRefactored() {
  const route = useRoute();
  const navigation = useNavigation<ProductDetailScreenNavigationProp>();
  const { theme } = useTheme();

  // Get product ID from route params
  const productId = (route.params as any)?.productId || '';

  const {
    product,
    loading,
    error,
    selectedSize,
    selectedColor,
    currentPrice,
    setSelectedSize,
    setSelectedColor,
    refreshProduct,
  } = useProductDetail(productId);

  // Track screen performance
  React.useEffect(() => {
    const endTracking = trackScreenLoad('ProductDetailScreen');
    return endTracking;
  }, []);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
  };

  const handlePriceChange = (price: number) => {
    // Price is automatically updated in the hook
  };

  const getProductDescription = (productName: string): string => {
    if (productName === 'ALL FOR SENSITIVE SERUM') {
      return 'GENOSYS ALL FOR SENSITIVE SERUM is a specialized skin repairing serum designed specifically for sensitive skin. This advanced formula provides a protective moisture barrier while delivering anti-inflammatory and soothing properties to calm and repair sensitized skin. Perfect for those with reactive, easily irritated skin. Repairing serum for sensitive skin. Strengthens moisture barrier and soothes irritation with advanced peptide technology.';
    }
    
    if (productName === 'EyeCell EYE CONTOUR CREAM') {
      return "GENOSYS EyeCell EYE CONTOUR CREAM is a daily eye care product specifically designed to address multiple concerns around the delicate eye area. This advanced eye cream targets fine wrinkles, crow's feet, dark circles, and under-eye puffiness while promoting microcirculation to enhance overall skin health and provide comprehensive eye area care.";
    }
    
    if (productName === 'EyeCell EYE CONTOUR SERUM') {
      return 'GENOSYS EyeCell EYE CONTOUR SERUM is a highly enriched all-in-one eye serum specifically designed to address multiple concerns around the delicate eye area. This advanced serum targets fine wrinkles, dark circles, and under-eye puffiness while promoting skin regeneration and providing comprehensive eye area care with its powerful peptide complex and botanical callus culture extracts.';
    }
    
    if (productName === 'EyeCell EYE PEPTIDE GEL PATCH') {
      return 'GENOSYS EyeCell EYE PEPTIDE GEL PATCH is a specialized treatment designed to rejuvenate and care for the delicate skin around the eyes. These crescent-shaped gel patches are infused with a potent blend of peptides, botanical extracts, and other active ingredients to address common eye area concerns including puffiness, dark circles, fine lines, and signs of fatigue.';
    }
    
    if (productName === 'EyeCell EYE ZONE CARE KIT') {
      return "GENOSYS EyeCell EYE ZONE CARE KIT is a comprehensive professional-grade solution designed to address various concerns in the delicate eye area, including fine lines, dark circles, puffiness, and crow's feet. This advanced kit combines cosmeceuticals with a specialized micro-needle roller to enhance the absorption of active ingredients and stimulate collagen production for comprehensive eye rejuvenation. Professional eye zone care kit with serum, cream, patches, and micro-needle roller. Comprehensive solution for wrinkles, dark circles, and puffiness.";
    }
    
    if (productName === 'GENO-LED IR II') {
      return 'GENOSYS GENO-LED IR II is an advanced LED therapy device that combines infrared and red light technology to provide professional-grade skin rejuvenation treatments. This innovative device utilizes specific wavelengths of light to stimulate cellular activity, promote collagen production, and enhance overall skin health for both professional and home use. Advanced LED therapy device with infrared and red light technology. Professional-grade skin rejuvenation for anti-aging, acne treatment, and skin healing.';
    }
    
    if (productName === 'SKIN REBOOT PDRN MASK PACK') {
      return 'SKIN REBOOT PDRN MASK PACK is a professional-grade treatment mask infused with PDRN (Polydeoxyribonucleotide) extracted from salmon DNA. This advanced mask promotes cellular regeneration, accelerates skin repair, and enhances overall skin health. Perfect for post-treatment care and intensive skin rejuvenation.';
    }
    
    if (productName === 'HR³ MATRIX HAIR SOLUTION α') {
      return 'GENOSYS HR³ MATRIX HAIR SOLUTION α is a premium scalp and hair care treatment specifically formulated to combat hair loss and promote healthy hair regrowth. This advanced solution addresses the fundamental causes of hair loss by accelerating angiogenesis, inhibiting hair loss substances, and providing essential nutrients to hair follicles for optimal growth and strength. Premium hair and scalp solution with advanced peptide technology. Prevents hair loss, promotes regrowth, and strengthens hair follicles with botanical extracts.';
    }
    
    if (productName === 'HR³ MATRIX MESOPECIA KIT') {
      return 'GENOSYS HR³ MATRIX MESOPECIA KIT is a comprehensive hair and scalp treatment system designed to prevent hair loss and promote healthy hair regrowth by addressing the fundamental causes of hair loss. This advanced kit combines multiple treatment components to create a complete solution for hair health and vitality, suitable for both professional and home use. Complete hair and scalp treatment system with scalp peeling, hair solution, and roller device. Prevents hair loss, stimulates regrowth, and promotes scalp health.';
    }
    
    if (productName === 'HR³ MATRIX SCALP PEELING α') {
      return 'GENOSYS HR³ MATRIX SCALP PEELING α is a gentle scalp peeling solution designed to cleanse and prepare the scalp for microneedling treatments. This advanced peeling formula effectively removes keratinized particles and impurities while providing a refreshing, cooling sensation that soothes the scalp and enhances treatment absorption. Gentle scalp peeling solution for microneedling treatment preparation. Removes keratinized particles, provides refreshing cooling sensation, and optimizes scalp condition for enhanced treatment absorption.';
    }
    
    if (productName === 'HR³ MATRIX SCALP SHAMPOO α') {
      return 'GENOSYS HR³ MATRIX SCALP SHAMPOO α is a functional shampoo specifically designed to improve hair loss conditions and promote scalp health. This KFDA-approved functional product helps control excess sebum, cools down scalp heat, and creates an optimal environment for healthy hair growth through its advanced ingredient complex. Professional functional shampoo for hair loss prevention and scalp health. KFDA-approved with advanced ingredient complex for optimal hair growth.';
    }
    
    if (productName === 'HR³ MATRIX HAIR TONIC α') {
      return 'GENOSYS HR³ MATRIX HAIR TONIC α is a specialized hair tonic designed to complement the HR³ MATRIX treatment system. This advanced tonic provides essential nutrients to hair follicles, improves scalp circulation, and supports healthy hair growth through its carefully formulated blend of active ingredients. Specialized hair tonic for scalp health and hair growth support. Provides essential nutrients and improves circulation for optimal hair health.';
    }
    
    if (productName === 'HR³ MATRIX SCALP AMPOULE α') {
      return 'GENOSYS HR³ MATRIX SCALP AMPOULE α is a concentrated scalp treatment ampoule designed to provide intensive care for hair loss prevention and scalp health. This advanced ampoule contains high concentrations of active ingredients to deliver maximum benefits for hair follicle stimulation and scalp rejuvenation. Concentrated scalp treatment ampoule for intensive hair loss prevention and scalp health. High concentration of active ingredients for maximum hair follicle stimulation.';
    }
    
    if (productName === 'HR³ MATRIX SCALP ROLLER α') {
      return 'GENOSYS HR³ MATRIX SCALP ROLLER α is a specialized microneedling device designed specifically for scalp treatments. This professional-grade roller enhances the absorption of active ingredients into the scalp, optimizing treatment effectiveness and ensuring deeper penetration for better results. Professional microneedling device for enhanced scalp treatment absorption. Optimizes treatment effectiveness with deeper ingredient penetration.';
    }
    
    if (productName === 'HR³ MATRIX SCALP BRUSH α') {
      return 'GENOSYS HR³ MATRIX SCALP BRUSH α is a specialized scalp massage brush designed to improve blood circulation and enhance the effectiveness of scalp treatments. This professional tool helps distribute active ingredients evenly while providing therapeutic massage benefits for optimal scalp health. Specialized scalp massage brush for improved circulation and treatment distribution. Professional tool for therapeutic massage and even ingredient distribution.';
    }
    
    if (productName === 'HR³ MATRIX SCALP KIT α') {
      return 'GENOSYS HR³ MATRIX SCALP KIT α is a comprehensive professional scalp treatment system designed for advanced hair loss prevention and scalp health. This complete kit combines multiple treatment components to provide a comprehensive solution for professional scalp care and hair restoration. Comprehensive professional scalp treatment system for advanced hair loss prevention. Complete kit with multiple components for professional scalp care.';
    }
    
    if (productName === 'HR³ MATRIX SCALP HOME CARE KIT α') {
      return 'GENOSYS HR³ MATRIX SCALP HOME CARE KIT α is a complete home care system designed to provide professional-grade scalp treatments in the comfort of your home. This comprehensive kit includes all necessary components for effective scalp care and hair loss prevention, making professional treatments accessible for daily use. Complete home care system for professional-grade scalp treatments. Comprehensive kit for effective daily scalp care and hair loss prevention.';
    }
    
    if (productName === 'SKIN CARING BLEMISH BALM CUSHION [SPF 50+ PA++++]') {
      return 'GENOSYS SKIN CARING BLEMISH BALM CUSHION is a BB cushion that can be used after professional treatment. More than 60% of the product is composed of moisture essence, which enables a natural and healthy glow. Various peptide complex 40% - helps calm the irritated skin. BB cushion with SPF 50. Natural coverage with skin protection and color selection options.';
    }
    
    if (productName === 'BIO-FERMENT AGE DEFYING POWDER MASK') {
      return 'GENOSYS BIO-FERMENT AGE DEFYING POWDER MASK is an innovative fermented powder mask that combines traditional fermentation technology with modern skincare science. This unique powder-to-mask formula activates upon mixing with water, creating a powerful treatment that delivers concentrated nutrients and beneficial compounds directly to the skin for maximum anti-aging benefits. Bio-ferment powder mask with age-defying technology. Unique powder-to-mask formula for maximum benefits.';
    }
    
    if (productName === 'EGF REPAIR OXYMASK CREAM') {
      return "GENOSYS EGF REPAIR OXYMASK CREAM is a unique oxygen bubbling mask cream designed to rejuvenate dull and stressed skin. This innovative 'S.O.S' cream effectively addresses skin damage from various causes, providing immediate relief and long-term skin regeneration through advanced oxygen therapy and skin-regenerating ingredients.";
    }
    
    if (productName === 'EPI TURNOVER BOOSTING PEELING GEL') {
      return 'GENOSYS EPI TURNOVER BOOSTING PEELING GEL is an enzyme-based exfoliating gel designed to gently remove dead skin cells without causing irritation. This innovative peeling gel utilizes natural enzymes and plant extracts to purify, nourish, and moisturize the skin, making it suitable for all skin types while promoting a smoother, more radiant complexion.';
    }
    
    if (productName === 'EZ CO₂ MASK KIT') {
      return "GENOSYS EZ CO₂ MASK KIT is a professional carboxy therapy system designed to deliver oxygen to the skin through the innovative 'Bohr Effect' mechanism. This advanced CO₂ therapy kit combines a specialized gel and sheet mask to accelerate oxygen delivery to skin tissues, providing firming, brightening, and anti-blemish effects while preparing the skin for optimal absorption of active ingredients.";
    }
    
    if (productName === 'MULTI FUNCTIONAL ANTI-WRINKLE SERUM') {
      return 'MULTI FUNCTIONAL ANTI-WRINKLE SERUM is an advanced anti-aging serum that combines the power of bakuchiol, a natural alternative to retinol, with cutting-edge peptide technology. This clinically-tested formula helps visibly smooth wrinkles, reinforce skin firmness, and restore youthful radiance for all skin types.';
    }
    
    if (productName === 'MULTI SUN CREAM [SPF 40 PA++]') {
      return 'MULTI SUN CREAM [SPF 40 PA++] is an advanced daily sunscreen designed to provide comprehensive UV protection while maintaining a natural, glowing complexion. This innovative formula combines high-level sun protection with skin-nourishing ingredients to protect against both UVA and UVB rays while promoting healthy, radiant skin.';
    }
    
    if (productName === 'ULTRA SHIELD SUN CREAM [SPF 50+ PA++++]') {
      return 'ULTRA SHIELD SUN CREAM [SPF 50+ PA++++] is a non-greasy, silky sunscreen with powerful UV protection and sunburn care effect. This advanced formula strongly defends skin against UV rays while promoting skin recovery from sun damage with innovative MicroHA™ and ProbioMETA™ technology.';
    }
    
    if (productName === 'MULTI VITA RADIANCE CREAM') {
      return "Multi-vitamin radiance cream with MELAZERO® technology. Brightens and evens skin tone. GENOSYS MULTI VITA RADIANCE CREAM combines a complex of 12 vitamins with potent antioxidants like Astaxanthin to provide effective protection against free radicals, thereby slowing down the skin's aging process. This advanced formula deeply nourishes and moisturizes the skin, evens out skin tone, and imparts a noticeable radiance while activating collagen production and shielding the skin from UV radiation and environmental stressors.";
    }
    
    if (productName === 'MULTI VITA RADIANCE SERUM') {
      return "Skin brightening serum with multi vitamins and patented MELAZERO® melanin care complex. Vitamin C derivative formula for even skin tone and natural radiance with moisturizing barrier protection. MULTI VITA RADIANCE SERUM is an advanced skin brightening serum that combines multi vitamins with patented MELAZERO® melanin care complex for comprehensive skin radiance. This innovative formula helps even skin tone, revive skin's natural brightness, and provides a natural glow with moisturizing barrier protection.";
    }
    
    if (productName === 'ND Cell ANTI-WRINKLE CREAM') {
      return 'ND Cell ANTI-WRINKLE CREAM is a specialized anti-aging cream designed for the delicate neck and décolleté area. This advanced formula targets the special needs of these sensitive areas with a powerful peptide complex and vitamin blend for lifting, firming, and depigmentation.';
    }
    
    if (productName === 'SKIN BARRIER PROTECTING CREAM') {
      return 'SKIN BARRIER PROTECTING CREAM is an advanced skin barrier strengthening cream with enriched ceramide and amino acid complex. This innovative formula encourages healthy and soft skin by promoting water retention and protecting the skin barrier with MultiEx BSASM® Plus technology.';
    }
    
    if (productName === 'Needle Pen-K') {
      return 'Needle Pen-K is a professional automatic microneedling device designed to enhance collagen production and improve transdermal nutrient delivery. This advanced device creates micro-channels in the skin to significantly increase the absorption rate of active skincare ingredients while promoting natural skin rejuvenation through controlled micro-injuries.';
    }
    
    if (productName === 'Hair-GENTRON') {
      return 'Hair-GENTRON is an advanced LED helmet device designed for professional hair loss treatment and scalp therapy. This innovative device combines multiple light therapy technologies with massaging and heating functions to promote hair growth, improve scalp circulation, and provide comprehensive hair and scalp care. Patent No. 10-2151442, Bronze medal winner of 2020 Korea invention patent competition. Advanced LED helmet device for professional hair loss treatment and scalp therapy with multi-light technology.';
    }
    
    if (productName === 'PEPTIDE GEL MASK') {
      return 'PEPTIDE GEL MASK is a revolutionary thermo-sensitive hydrogel mask that provides instant cooling relief and deep hydration for post-treatment skin care. This patented technology transforms from gel to fluid upon contact with skin temperature, ensuring optimal ingredient delivery and maximum comfort.';
    }
    
    if (productName === 'POWER SOLUTION AWS') {
      return 'POWER SOLUTION AWS is a professional anti-aging ampoule specifically formulated for microneedling treatments. This advanced formula helps reduce the appearance of wrinkles and improve skin firmness while promoting optimal healing and skin regeneration post-treatment.';
    }
    
    if (productName === 'POWER SOLUTION CTS') {
      return 'POWER SOLUTION CTS is a professional skin remodeling ampoule specifically formulated for microneedling treatments. This advanced formula helps the skin retain its natural elasticity and increases skin strength while promoting optimal healing and regeneration post-treatment.';
    }
    
    if (productName === 'POWER SOLUTION CVS') {
      return 'POWER SOLUTION CVS is a professional skin revitalizing ampoule designed specifically for microneedling treatments. This advanced formula supplies essential nutrients to the skin while providing soothing and hydrating benefits to promote optimal healing and skin regeneration post-treatment.';
    }
    
    if (productName === 'POWER SOLUTION HES') {
      return 'POWER SOLUTION HES is a professional hydrating and firming ampoule specifically formulated for microneedling treatments. This advanced formula combines powerful hydrating agents with firming peptides to provide long-lasting moisturizing and plumping effects while relieving skin irritation and promoting optimal healing post-treatment.';
    }
    
    if (productName === 'POWER SOLUTION PCS') {
      return 'POWER SOLUTION PCS is a professional anti-blemish ampoule specifically formulated for microneedling treatments. This advanced formula controls excessive oil and sebum production while helping prevent skin breakouts and promoting clear, healthy skin post-treatment.';
    }
    
    if (productName === 'POWER SOLUTION SWS') {
      return 'POWER SOLUTION SWS is a professional anti-pigment ampoule specifically formulated for microneedling treatments. This advanced formula helps improve pigmentation, even skin tone, and brighten the skin surface while promoting optimal healing and skin clarity post-treatment.';
    }
    
    if (productName === 'PROBLEM CONTROL SERUM') {
      return 'PROBLEM CONTROL SERUM is a specialized anti-blemish serum designed for combination and oily acne-prone skin. This advanced formula helps fight skin breakouts by regulating excessive oil and sebum production while refining skin texture for a healthier, clearer complexion.';
    }
    
    if (productName === 'SOOTHING REPAIR POSTCREAM') {
      return 'SOOTHING REPAIR POSTCREAM is a specialized regenerating cream designed for healthy skin recovery after professional treatments. This advanced formula helps irritated skin rapidly recover from redness, erythema, and edema while promoting healthy rejuvenation with centella complex and peptide technology.';
    }
    
    if (productName === 'SKIN CARING BLEMISH BALM CUSHION [SPF 50+ PA++++]') {
      return 'SKIN CARING BLEMISH BALM CUSHION is a BB cushion that can be used after professional treatment. More than 60% of the product is composed of moisture essence, which enables a natural and healthy glow. Various peptide complex 40% - helps calm the irritated skin. (SPF 50 / PA++++)';
    }
    
    if (productName === 'SKIN DEFENDER LIP & EYE MAKEUP REMOVER') {
      return 'SKIN DEFENDER LIP & EYE MAKEUP REMOVER is an advanced biphasic makeup remover specifically designed for the delicate lip and eye areas. This innovative formula combines vitamin complex and firming peptides to provide gentle yet effective cleansing without irritation.';
    }
    
    if (productName === 'SNOW O₂ CLEANSER') {
      return 'SNOW O₂ CLEANSER is a revolutionary oxygen bubble cleanser that combines gentle cleansing with oxygen therapy for deep skin nourishment. This innovative formula naturally generates oxygen bubbles to effectively remove makeup, dirt, and impurities while providing a luxurious treatment sensation without irritation.';
    }
    
    if (productName === 'SNOW BOOSTER') {
      return 'SNOW BOOSTER is a premium daily moisturizing and skin refining toner designed for all skin types. This advanced formula combines powerful botanical extracts with innovative fermentation technology to provide deep hydration, pH balancing, and skin refinement for a healthy, glowing complexion.';
    }
    
    if (productName === 'SKIN RENEWAL PEELING SYSTEM (SRS)') {
      return 'SKIN RENEWAL PEELING SYSTEM (SRS) is a professional peeling treatment with naturally occurring AHA acids designed for smoother, brighter, and more even skin tone. These naturally occurring acids found in fruits and other foods help remove dead cells on the surface of the skin, encouraging cell turnover and bringing new healthy cells to the surface.';
    }
    
    if (productName === 'MICROBIOME ENERGY INFUSING MIST') {
      return "MICROBIOME ENERGY INFUSING MIST is an advanced revitalizing mist designed to restore and balance the skin's natural microbiome while providing instant hydration and radiance. This innovative formula combines cutting-edge probiotic technology with powerful hydrating ingredients to enhance skin's natural strength and glow.";
    }
    
    if (productName === 'SOOTHING BOMB SEA ALGAE MASK') {
      return 'SOOTHING BOMB SEA ALGAE MASK is an Eucalace® sheet mask inspired by the healing power of the ocean. This innovative mask provides intensive relief to the skin and moisturizes with sea algae complex and centella asiatica extract for comprehensive skin healing and hydration.';
    }
    
    if (productName === 'SKIN RESCUE OVERNIGHT CREAM MASK') {
      return 'SKIN RESCUE OVERNIGHT CREAM MASK is a revitalizing overnight treatment that provides intensive care to fatigued skin. This innovative dual formula combines oxygen capsules with pink ceramide complex for comprehensive skin renewal and recovery.';
    }
    
    if (productName === 'Microneedle Roller') {
      return 'The GENOSYS Microneedle Roller is a professional-grade microneedling device featuring the patented Diskneedle Therapy System (DTS) for enhanced skin rejuvenation. This advanced device utilizes 450 ultra-thin needles that are 25% thinner than competitors, ensuring superior product absorption with minimal skin trauma. Stimulates natural collagen production and improves skin texture. Manufactured in South Korea.';
    }
    
    // Check for collagen mask
    const isCollagenMask = productName.toLowerCase().includes('intensive repair collagen mask');
    if (isCollagenMask) {
      return 'INTENSIVE REPAIR COLLAGEN MASK is a professional-grade sheet mask designed to restore skin firmness and elasticity. This innovative mask provides intensive repair and anti-aging benefits with hydrolyzed collagen and hyaluronic acid for comprehensive skin nourishment and hydration.';
    }
    
    // Default description for products not specifically listed
    return 'Premium Korean dermacosmetics product designed for professional skincare results. This high-quality product combines advanced Korean skincare technology with proven ingredients to deliver exceptional results for all skin types.';
  };

  const getProductDetails = (product: Product) => {
    const name = product.name.toLowerCase();

    // ALL FOR SENSITIVE SERUM
    if (name.includes('all for sensitive serum')) {
      return (
        <>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Type:</Text> Repairing serum for sensitive skin
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Size:</Text> 30ml
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Skin Type:</Text> Sensitive, reactive, and easily irritated skin
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Formulation:</Text> Gentle, non-irritating serum
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Key Benefits:</Text> Barrier repair, anti-inflammatory, soothing
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Technology:</Text> Advanced peptide technology
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Usage:</Text> Apply to clean skin in the morning and evening
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Application:</Text> Gently pat with fingers until fully absorbed
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Testing:</Text> Dermatologically tested and specifically formulated for sensitive skin
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Country of Origin:</Text> South Korea
          </Text>
        </>
      );
    }

    // BIO-FERMENT AGE DEFYING POWDER MASK
    if (name.includes('bio-ferment age defying powder mask')) {
      return (
        <>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Form:</Text> Powder mask (activates with water)
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Size:</Text> 300g
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Skin Type:</Text> All skin types, especially mature and aging skin
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Technology:</Text> Bio-fermentation process
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Key Benefits:</Text> Age defying, skin renewal, deep hydration
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Usage:</Text> 1-2 times per week
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Country of Origin:</Text> South Korea
          </Text>
        </>
      );
    }

    // EyeCell EYE ZONE CARE KIT
    if (name.includes('eyecell eye zone care kit')) {
      return (
        <>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Form:</Text> Professional eye care system
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Size:</Text> 1 box
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Skin Type:</Text> All skin types, especially mature and aging skin
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Technology:</Text> Micro-needling + advanced peptide technology
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Key Benefits:</Text> Wrinkle reduction, dark circle diminishment, puffiness relief
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Usage:</Text> Professional and home care
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Kit Contents:</Text> 4 components (serum, cream, patches, eye roller)
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Country of Origin:</Text> South Korea
          </Text>
        </>
      );
    }

    // GENO-LED IR II
    if (name.includes('geno-led ir ii')) {
      return (
        <>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Light Wavelengths:</Text> Red light (630-660nm) and Infrared (800-1000nm)
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Treatment Time:</Text> 10-20 minutes per session
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Frequency:</Text> 3-5 times per week for optimal results
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Safety:</Text> FDA-cleared for home use
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Power Source:</Text> Rechargeable battery with long-lasting performance
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Design:</Text> Ergonomic, portable, and easy to use
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Country of Origin:</Text> South Korea
          </Text>
        </>
      );
    }

    // Hair-GENTRON
    if (name.includes('hair-gentron')) {
      return (
        <>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Type:</Text> LED helmet with massaging and heating functions
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Size:</Text> 1 Device
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Patent:</Text> No. 10-2151442 (Korea)
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Award:</Text> Bronze medal winner of 2020 Korea invention patent competition
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Light Types:</Text> Infrared + Red + Blue LED combination
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Features:</Text> Massaging, heating, music mode
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Usage:</Text> Professional and home care
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Country of Origin:</Text> South Korea
          </Text>
        </>
      );
    }

    // HR³ MATRIX MESOPECIA KIT
    if (name.includes('hr³ matrix mesopecia kit')) {
      return (
        <>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Form:</Text> Professional hair and scalp treatment kit
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Size:</Text> 1 Kit
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Target:</Text> Hair loss prevention and regrowth
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Technology:</Text> Advanced peptide and botanical extract technology
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Key Benefits:</Text> Hair loss prevention, regrowth stimulation, scalp health
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Usage:</Text> Professional and home care
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Kit Contents:</Text> Scalp peeling, hair solution, roller device
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Country of Origin:</Text> South Korea
          </Text>
        </>
      );
    }

    // HR³ MATRIX SCALP PEELING α
    if (name.includes('hr³ matrix scalp peeling α')) {
      return (
        <>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Form:</Text> Scalp peeling solution
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Size:</Text> 100ml
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Target:</Text> Scalp preparation for microneedling treatments
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Technology:</Text> Gentle exfoliating and refreshing formula
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Key Benefits:</Text> Scalp cleansing, refreshing sensation, treatment preparation
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Usage:</Text> Professional and home care
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Country of Origin:</Text> South Korea
          </Text>
        </>
      );
    }

    // HR³ MATRIX HAIR SOLUTION α
    if (name.includes('hr³ matrix hair solution α')) {
      return (
        <>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Form:</Text> Premium hair and scalp solution
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Size:</Text> 5ml*8pcs
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Target:</Text> Hair loss prevention and regrowth
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Technology:</Text> Advanced peptide and botanical extract technology
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Key Benefits:</Text> Hair loss prevention, regrowth stimulation, scalp health
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Usage:</Text> Professional and home care
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>System:</Text> Part of HR³ MATRIX MESOPECIA KIT
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Country of Origin:</Text> South Korea
          </Text>
        </>
      );
    }

    // HR³ MATRIX SCALP SHAMPOO α
    if (name.includes('hr³ matrix scalp shampoo α')) {
      return (
        <>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Form:</Text> Functional scalp shampoo
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Size:</Text> 300ml
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Target:</Text> Hair loss prevention and scalp health
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Technology:</Text> Patented ingredient complex with KFDA approval
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Key Benefits:</Text> Hair loss prevention, scalp cooling, sebum control
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Usage:</Text> Professional and home care
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Approval:</Text> KFDA approved functional product
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Country of Origin:</Text> South Korea
          </Text>
        </>
      );
    }

    // HR³ MATRIX HAIR TONIC α
    if (name.includes('hr³ matrix hair tonic α')) {
      return (
        <>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Form:</Text> Specialized hair tonic
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Size:</Text> 100ml
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Target:</Text> Scalp health and hair growth support
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Technology:</Text> Advanced ingredient complex for hair health
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Key Benefits:</Text> Scalp health, hair growth support, circulation improvement
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Usage:</Text> Professional and home care
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>System:</Text> Part of HR³ MATRIX treatment protocol
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Country of Origin:</Text> South Korea
          </Text>
        </>
      );
    }

    // HR³ MATRIX SCALP AMPOULE α
    if (name.includes('hr³ matrix scalp ampoule α')) {
      return (
        <>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Form:</Text> Concentrated scalp treatment ampoule
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Size:</Text> 1.5ml*10pcs
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Target:</Text> Intensive hair loss prevention and scalp health
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Technology:</Text> High concentration active ingredient technology
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Key Benefits:</Text> Hair follicle stimulation, scalp rejuvenation, intensive care
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Usage:</Text> Professional and home care
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Country of Origin:</Text> South Korea
          </Text>
        </>
      );
    }

    // HR³ MATRIX SCALP ROLLER α
    if (name.includes('hr³ matrix scalp roller α')) {
      return (
        <>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Form:</Text> Professional microneedling device
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Size:</Text> 1 Device
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Target:</Text> Enhanced scalp treatment absorption
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Technology:</Text> Professional microneedling technology
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Key Benefits:</Text> Enhanced absorption, deeper penetration, treatment optimization
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Usage:</Text> Professional and home care
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Country of Origin:</Text> South Korea
          </Text>
        </>
      );
    }

    // HR³ MATRIX SCALP BRUSH α
    if (name.includes('hr³ matrix scalp brush α')) {
      return (
        <>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Form:</Text> Specialized scalp massage brush
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Size:</Text> 1 Device
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Target:</Text> Improved circulation and treatment distribution
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Technology:</Text> Professional massage brush technology
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Key Benefits:</Text> Improved circulation, therapeutic massage, even distribution
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Usage:</Text> Professional and home care
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Country of Origin:</Text> South Korea
          </Text>
        </>
      );
    }

    // HR³ MATRIX SCALP KIT α
    if (name.includes('hr³ matrix scalp kit α')) {
      return (
        <>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Form:</Text> Comprehensive professional scalp treatment system
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Size:</Text> 1 Kit
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Target:</Text> Advanced hair loss prevention and scalp health
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Technology:</Text> Multi-component treatment system
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Key Benefits:</Text> Comprehensive treatment, professional care, hair restoration
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Usage:</Text> Professional treatment
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Country of Origin:</Text> South Korea
          </Text>
        </>
      );
    }

    // HR³ MATRIX SCALP HOME CARE KIT α
    if (name.includes('hr³ matrix scalp home care kit α')) {
      return (
        <>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Form:</Text> Complete home care system
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Size:</Text> 1 Kit
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Target:</Text> Professional-grade scalp treatments at home
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Technology:</Text> Home care treatment system
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Key Benefits:</Text> Professional-grade treatments, daily care, hair loss prevention
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Usage:</Text> Home care
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Country of Origin:</Text> South Korea
          </Text>
        </>
      );
    }

    // SKIN CARING BLEMISH BALM CUSHION [SPF 50+ PA++++]
    if (name.includes('skin caring blemish balm cushion')) {
      return (
        <>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Form:</Text> Blemish balm cushion
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Size:</Text> 15g (includes replacement refill)
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Target:</Text> Post-treatment coverage and skin protection
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Technology:</Text> 60% moisture essence with 40% peptide complex
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Key Benefits:</Text> Natural healthy glow, skin calming, sun protection, post-treatment care
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Usage:</Text> Daily makeup base, especially after professional treatments
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Skin Type:</Text> All skin types, especially post-treatment skin
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>SPF Rating:</Text> SPF 50 / PA++++
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Available Colors:</Text> Beige, Ivory, Camel
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Color Note:</Text> Beige is darker than Ivory to suit Fitzpatrick 2-4
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Country of Origin:</Text> South Korea
          </Text>
          {selectedColor && (
            <Text style={[styles.detailItem, { color: theme.colors.text }]}>
              <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Selected Color:</Text> {selectedColor} ({getColorDescription(selectedColor)})
            </Text>
          )}
        </>
      );
    }

    // INTENSIVE HYDRO SOOTHING CREAM
    if (name.includes('intensive hydro soothing cream')) {
      return (
        <>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Type:</Text> Intensive hydro
            soothing cream
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Size Options:</Text> 50g (Homecare)
            / 250g (Professional)
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Key Benefits:</Text> Hydration,
            soothing, skin repair, barrier protection
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Skin Type:</Text> All skin types,
            especially sensitive and irritated skin
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Usage:</Text> Professional and home
            care
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Country of Origin:</Text> South
            Korea
          </Text>
        </>
      );
    }

    // MULTI FUNCTIONAL ANTI-WRINKLE CREAM
    if (name.includes('multi functional anti-wrinkle cream')) {
      return (
        <>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Form:</Text> Multi-functional
            anti-wrinkle cream
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Size:</Text> 50g (Homecare) / 250g
            (Professional)
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Target:</Text> Anti-aging and
            wrinkle reduction
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Technology:</Text> Advanced
            anti-aging formula with multi-functional benefits
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Key Benefits:</Text> Wrinkle
            reduction, firming, collagen synthesis, antioxidant protection
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Usage:</Text> Morning and/or
            evening application
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Skin Type:</Text> All skin types,
            especially mature skin
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Formulation:</Text> Advanced
            anti-aging cream with multi-functional benefits
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Country of Origin:</Text> South
            Korea
          </Text>
        </>
      );
    }

    // MULTI FUNCTIONAL ANTI-WRINKLE SERUM
    if (name.includes('multi functional anti-wrinkle serum')) {
      return (
        <>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Type:</Text> Multi-functional
            anti-wrinkle serum
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Size:</Text> 30ml
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Key Benefits:</Text> Wrinkle
            reduction, skin firmness, anti-aging
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Skin Type:</Text> All skin types,
            especially aging and mature skin
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Usage:</Text> Daily anti-aging
            treatment
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Clinical Testing:</Text> Clinically
            tested for efficacy and safety
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Country of Origin:</Text> South
            Korea
          </Text>
        </>
      );
    }

    // MULTI SUN CREAM
    if (name.includes('multi sun cream')) {
      return (
        <>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Type:</Text> Daily sunscreen with SPF 40 PA++
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Size:</Text> 40g
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Protection:</Text> UVA/UVB protection, SPF 40, PA++
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Skin Type:</Text> All skin types, including sensitive skin
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Usage:</Text> Daily sun protection, outdoor activities
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Country of Origin:</Text> South Korea
          </Text>
        </>
      );
    }

    // ULTRA SHIELD SUN CREAM
    if (name.includes('ultra shield sun cream')) {
      return (
        <>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Form:</Text> Daily sunscreen with sunburn care
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Size:</Text> 50g
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Protection:</Text> SPF 50+ PA++++
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Target:</Text> UV protection and sunburn care
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Technology:</Text> MicroHA™ and ProbioMETA™ technology
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Key Benefits:</Text> UV protection, sunburn care, skin recovery, reef-safe protection
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Usage:</Text> Daily sun protection, reapply every 2 hours
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Skin Type:</Text> All skin types
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Application:</Text> Apply generously to all exposed skin areas
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Formulation:</Text> Non-greasy, silky texture with tropical antioxidant complex
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Country of Origin:</Text> South Korea
          </Text>
        </>
      );
    }

    // ND CELL ANTI-WRINKLE CREAM
    if (name.includes('nd cell anti-wrinkle cream')) {
      return (
        <>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Form:</Text> Specialized anti-aging cream
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Size:</Text> 50g
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Target:</Text> Neck and décolleté area anti-aging
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Technology:</Text> Advanced peptide complex with vitamin blend
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Key Benefits:</Text> Lifting, firming, depigmentation, texture refinement
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Usage:</Text> Daily anti-aging treatment, morning and evening
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Skin Type:</Text> All skin types, especially aging neck and décolleté
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Application:</Text> Apply to clean neck and décolleté area
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Testing:</Text> Dermatologically tested and clinically proven
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Country of Origin:</Text> South Korea
          </Text>
        </>
      );
    }

    // NEEDLE PEN-K
    if (name.includes('needle pen-k')) {
      return (
        <>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Form:</Text> Professional automatic microneedling device
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Size:</Text> 1 Device
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Target:</Text> Collagen production and transdermal nutrient delivery
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Technology:</Text> Automatic microneedling with adjustable depth and speed
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Key Benefits:</Text> Collagen production, enhanced absorption, skin rejuvenation, micro-channel creation
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Usage:</Text> Professional and home use, controlled micro-injuries
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Skin Type:</Text> All skin types, especially aging and textured skin
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Application:</Text> Creates micro-channels for enhanced ingredient absorption
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Safety:</Text> Professional-grade device with controlled penetration
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Country of Origin:</Text> South Korea
          </Text>
        </>
      );
    }

    // PEPTIDE GEL MASK
    if (name.includes('peptide gel mask')) {
      return (
        <>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Form:</Text> Professional thermo-sensitive hydrogel mask
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Size:</Text> 38g x 5ea
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Target:</Text> Post-treatment care and cooling therapy
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Technology:</Text> Thermo-sensitive hydrogel with collagen and cooling agents
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Key Benefits:</Text> Cooling therapy, collagen delivery, post-treatment care, skin soothing
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Usage:</Text> Post-treatment application, cooling therapy sessions
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Skin Type:</Text> All skin types, especially post-treatment skin
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Application:</Text> Apply after treatments for cooling and collagen delivery
          </Text>
          <Text style={[styles.detailItem, { color: theme.colors.text }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Country of Origin:</Text> South Korea
          </Text>
        </>
      );
    }

    // Default details for products not specifically listed
    return (
      <>
        <Text style={[styles.detailItem, { color: theme.colors.text }]}>
          <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Type:</Text> {product.name}
        </Text>
        <Text style={[styles.detailItem, { color: theme.colors.text }]}>
          <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Brand:</Text> {product.brand}
        </Text>
        <Text style={[styles.detailItem, { color: theme.colors.text }]}>
          <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Price:</Text> <Text style={{ color: '#DC2626', fontWeight: 'bold' }}>AED {product.price.toFixed(2)}</Text>
        </Text>
        <Text style={[styles.detailItem, { color: theme.colors.text }]}>
          <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Country of Origin:</Text> South Korea
        </Text>
        <Text style={[styles.detailItem, { color: theme.colors.text }]}>
          <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Usage:</Text> Apply to clean skin as directed
        </Text>
      </>
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading product details...
        </Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View
        style={[
          styles.errorContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text style={[styles.errorText, { color: theme.colors.text }]}>
          {error || 'Product not found'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshProduct}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar barStyle='dark-content' backgroundColor='#ffffff' />

      <ProductHeader product={product} onBackPress={handleBackPress} />

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <ProductImage product={product} />

        <ProductPricing
          product={product}
          onSizeChange={handleSizeChange}
          onPriceChange={handlePriceChange}
        />

        {/* Color Selection Section for SKIN CARING BLEMISH BALM CUSHION */}
        {product.name === 'SKIN CARING BLEMISH BALM CUSHION [SPF 50+ PA++++]' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text, textAlign: 'center' }]}>Select Color</Text>
            <View style={styles.colorSelectionContainer}>
              {['Beige', 'Ivory', 'Camel'].map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    {
                      backgroundColor: selectedColor === color ? '#F0F9FF' : theme.colors.card,
                      borderColor: selectedColor === color ? '#3B82F6' : '#E5E7EB',
                      borderWidth: selectedColor === color ? 3 : 1,
                      shadowColor: selectedColor === color ? '#3B82F6' : 'transparent',
                      shadowOffset: {
                        width: 0,
                        height: 2,
                      },
                      shadowOpacity: selectedColor === color ? 0.2 : 0,
                      shadowRadius: 4,
                      elevation: selectedColor === color ? 4 : 1,
                    },
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  <View style={[styles.colorSwatch, { backgroundColor: getColorSwatch(color) }]}>
                    {selectedColor === color && (
                      <View style={styles.selectionIndicator}>
                        <Text style={styles.checkmark}>✓</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[
                    styles.colorLabel,
                    { color: selectedColor === color ? '#1E40AF' : theme.colors.text }
                  ]}>
                    {color}
                  </Text>
                  <Text style={[
                    styles.colorDescription, 
                    { color: selectedColor === color ? '#1E40AF' : theme.colors.textSecondary }
                  ]}>
                    {getColorDescription(color)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <ProductDetails product={product} />
        
        {/* Comprehensive Product Information */}
      <View style={styles.content}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Product Description</Text>
            <View style={[styles.descriptionBlock, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.description, { color: theme.colors.text }]}>
                {getProductDescription(product.name)}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Product Details</Text>
            <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
              {getProductDetails(product)}
            </View>
          </View>

        {/* Key Features Section for SKIN REBOOT PDRN MASK PACK */}
        {product.name === 'SKIN REBOOT PDRN MASK PACK' && (
        <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Key Features</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>PDRN Technology:</Text>{' '}
                  Contains PDRN extracted from salmon DNA to promote cellular
                  regeneration and accelerate skin healing and repair processes.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Ultra-Slim Fit Sheet:</Text>{' '}
                  Ultra-slim fit sheet adheres seamlessly to the skin for
                  effective delivery of active ingredients and maximum
                  absorption.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Convenient Packaging:</Text>{' '}
                  Contains 30 sheets per container with tissue-style packaging
                  that allows for convenient one-by-one dispensing with built-in
                  tweezers.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>
                    Skin Barrier Restoration:
                  </Text>{' '}
                  Clinical results show significant improvement in restoring the
                  skin barrier damaged by physical irritation or environmental
                  stress.
                </Text>
            </View>
        </View>
        )}

        {/* Key Features Section for SKIN RESCUE OVERNIGHT CREAM MASK */}
        {product.name === 'SKIN RESCUE OVERNIGHT CREAM MASK' && (
        <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Key Features</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>
                    Dual Formula Technology:
                  </Text>{' '}
                  Combines oxygen capsules with pink ceramide complex for
                  comprehensive skin recovery and protection.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Overnight Treatment:</Text>{' '}
                  Specifically designed for overnight use to maximize skin
                  recovery while you sleep.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Oxygen Therapy:</Text>{' '}
                  Italian oxygenated water capsules that burst on contact,
                  delivering instant oxygen therapy for skin renewal.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Growth Factor Complex:</Text>{' '}
                  Contains EGF, aFGF, bFGF, PIGF, IGF growth factors that work
                  together to promote skin renewal and healing.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Clinical Results:</Text>{' '}
                  Clinically proven to improve erythema and transepidermal water
                  loss for healthier, more resilient skin.
                </Text>
          </View>
        </View>
        )}

        {/* Key Features Section for HR³ MATRIX HAIR SOLUTION α */}
        {product.name === 'HR³ MATRIX HAIR SOLUTION α' && (
        <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Key Features</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>
                    Advanced Peptide Technology:
                  </Text>{' '}
                  Features Sh-polypeptide-71, Copper Tripeptide-1, and
                  Pentapeptide-20 for targeted hair follicle support and growth
                  stimulation.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Botanical Extracts:</Text>{' '}
                  Rich blend of traditional herbs including Sophora Japonica,
                  Portulaca Oleracea, and Polygonum Multiflorum for natural
                  scalp nourishment.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>
                    Scalp Circulation Enhancement:
                  </Text>{' '}
                  Niacinamide and botanical extracts work together to improve
                  blood circulation and nutrient delivery to hair follicles.
                </Text>
          </View>
        </View>
        )}

        {/* Kit Components Section for HR³ MATRIX MESOPECIA KIT */}
        {product.name === 'HR³ MATRIX MESOPECIA KIT' && (
        <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Kit Components</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>
                    HR³ MATRIX SCALP PEELING (100ml):
                  </Text>{' '}
                  Deep-cleansing solution that removes keratin, sebum, and
                  impurities while providing a refreshing cooling effect for
                  optimal scalp preparation.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>
                    HR³ MATRIX HAIR SOLUTION (5ml x 6 vials):
                  </Text>{' '}
                  Premium scalp and hair care product that combats factors
                  causing hair loss, accelerates angiogenesis, and inhibits
                  substances responsible for hair thinning.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>
                    GENOSYS STAMP (ROLLER):
                  </Text>{' '}
                  Specialized device designed to enhance absorption of active
                  ingredients into the scalp, optimizing treatment effectiveness
                  and ensuring deeper penetration.
                </Text>
          </View>
        </View>
        )}

        {/* Key Features Section for MULTI FUNCTIONAL ANTI-WRINKLE SERUM */}
        {product.name === 'MULTI FUNCTIONAL ANTI-WRINKLE SERUM' && (
        <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Key Features</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>
                    Natural Retinol Alternative:
                  </Text>{' '}
                  Features bakuchiol, a plant-derived alternative to retinol
                  that provides anti-aging benefits without irritation.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>
                    Advanced Peptide Complex:
                  </Text>{' '}
                  Contains Anti-aging Peptide 6 and other peptides that target
                  specific signs of aging for comprehensive results.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>
                    Lipid Barrier Technology:
                  </Text>{' '}
                  Innovative liposome delivery system with ceramides,
                  cholesterol, and phytosphingosine for enhanced penetration.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Clinical Validation:</Text>{' '}
                  Clinically tested with proven results in improving skin age
                  index and overall skin quality.
                </Text>
          </View>
        </View>
        )}

        {/* Key Features Section for MULTI SUN CREAM */}
      {product.name === 'MULTI SUN CREAM [SPF 40 PA++]' && (
      <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Key Features</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>High SPF Protection:</Text>{' '}
                  SPF 40 PA++ provides strong protection against both UVA and
                  UVB rays for comprehensive sun defense.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Non-Greasy Formula:</Text>{' '}
                  Lightweight, non-greasy texture that absorbs quickly without
                  leaving a white cast or sticky residue.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Skin Glowing Effect:</Text>{' '}
                  Advanced formula that enhances natural skin radiance while
                  providing sun protection.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Daily Use Formula:</Text>{' '}
                  Gentle enough for daily use while providing robust protection
                  for all skin types.
                </Text>
        </View>
      </View>
      )}

          {/* Key Features Section for ULTRA SHIELD SUN CREAM */}
      {product.name === 'ULTRA SHIELD SUN CREAM [SPF 50+ PA++++]' && (
      <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Key Features</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Ultra-High Protection:</Text>{' '}
                  SPF 50+ PA++++ provides maximum protection against both UVA
                  and UVB rays.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Non-Greasy Formula:</Text>{' '}
                  Silky, lightweight texture that absorbs quickly without
                  leaving a greasy residue.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Sunburn Care Complex:</Text>{' '}
                  Specialized complex that helps promote skin recovery from sun
                  damage and exposure.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Reef-Safe Formula:</Text>{' '}
                  Environmentally friendly formula that is safe for coral reefs
                  and marine life.
                </Text>
          </View>
        </View>
        )}

          {/* Key Features Section for ALL FOR SENSITIVE SERUM */}
          {product.name === 'ALL FOR SENSITIVE SERUM' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Benefits</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Skin Barrier Repair:</Text>{' '}
                  Strengthens and rebuilds the skin's natural protective barrier
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Anti-Inflammatory:</Text>{' '}
                  Reduces redness and calms irritated, sensitive skin
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Soothing Relief:</Text>{' '}
                  Provides immediate comfort for sensitized skin
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Moisture Barrier:</Text>{' '}
                  Creates a protective layer to prevent moisture loss
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Gentle Formula:</Text>{' '}
                  Specifically designed for sensitive and reactive skin
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Skin Repair:</Text>{' '}
                  Helps repair damaged skin and restore healthy function
                </Text>
              </View>
            </View>
          )}

          {/* Key Ingredients Section for ALL FOR SENSITIVE SERUM */}
          {product.name === 'ALL FOR SENSITIVE SERUM' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Key Ingredients</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>MultiEx BSASM® Plus:</Text>{' '}
                  A patented complex that helps strengthen the skin barrier and provides long-lasting hydration while protecting sensitive skin from environmental stressors.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Phytolex SC:</Text>{' '}
                  A plant-derived ingredient that provides natural anti-inflammatory benefits and helps soothe irritated skin while supporting the skin's natural healing process.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Hyaluronic Acid:</Text>{' '}
                  A powerful humectant that attracts and retains moisture, providing deep hydration without causing irritation or clogging pores.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Phytosphingosine:</Text>{' '}
                  A natural lipid that helps restore the skin's barrier function and provides gentle antimicrobial protection while being suitable for sensitive skin.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Aloe Barbadensis Leaf Extract:</Text>{' '}
                  Known for its soothing and healing properties, aloe vera helps calm irritated skin, reduce inflammation, and provide natural moisture to sensitive skin.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Hamamelis Virginiana (Witch Hazel) Extract:</Text>{' '}
                  A natural astringent that helps tighten pores, reduce inflammation, and provide gentle cleansing properties while being gentle on sensitive skin.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Beta-Glucan:</Text>{' '}
                  A natural immune-boosting ingredient that helps strengthen the skin's defense mechanisms, reduce inflammation, and promote healing in sensitive skin.
                </Text>
              </View>
            </View>
          )}

          {/* Note Section for ALL FOR SENSITIVE SERUM */}
          {product.name === 'ALL FOR SENSITIVE SERUM' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Important Note</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Note:</Text>{' '}
                  This product is dermatologically tested and specifically formulated for sensitive skin. For best results, use as part of your daily sensitive skin care routine.
                </Text>
              </View>
            </View>
          )}

          {/* Benefits Section for BIO-FERMENT AGE DEFYING POWDER MASK */}
          {product.name === 'BIO-FERMENT AGE DEFYING POWDER MASK' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Benefits</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Age Defying:</Text>{' '}
                  Reduces fine lines and wrinkles through advanced fermentation technology
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Bio-Ferment Technology:</Text>{' '}
                  Harnesses the power of beneficial microorganisms for skin health
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Deep Penetration:</Text>{' '}
                  Powder-to-mask formula ensures maximum ingredient absorption
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Antioxidant Protection:</Text>{' '}
                  Neutralizes free radicals and environmental damage
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Skin Renewal:</Text>{' '}
                  Promotes cellular turnover for younger-looking skin
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Hydration Boost:</Text>{' '}
                  Provides intense moisture and plumping effects
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Firming Action:</Text>{' '}
                  Improves skin elasticity and firmness
                </Text>
              </View>
            </View>
          )}

          {/* Key Ingredients Section for BIO-FERMENT AGE DEFYING POWDER MASK */}
          {product.name === 'BIO-FERMENT AGE DEFYING POWDER MASK' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Key Ingredients</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Bio-Fermented Extracts:</Text>{' '}
                  Advanced fermentation process creates beneficial compounds, peptides, and amino acids that enhance skin barrier function and provide anti-aging benefits through natural biological processes.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Fermented Rice Extract:</Text>{' '}
                  Rich in vitamins, minerals, and antioxidants, fermented rice provides gentle exfoliation and brightening effects while nourishing the skin with essential nutrients.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Fermented Soybean Extract:</Text>{' '}
                  Contains isoflavones and peptides that help improve skin elasticity, reduce inflammation, and provide antioxidant protection against environmental stressors.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Fermented Green Tea Extract:</Text>{' '}
                  Enhanced antioxidant properties through fermentation, providing superior protection against free radicals and helping to reduce signs of aging and environmental damage.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Fermented Ginseng Extract:</Text>{' '}
                  Traditional Korean ingredient enhanced through fermentation, providing energizing and revitalizing effects while improving skin tone and reducing fatigue signs.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Hyaluronic Acid:</Text>{' '}
                  Provides intense hydration and plumping effects, helping to reduce the appearance of fine lines and wrinkles while maintaining optimal skin moisture levels.
                </Text>
              </View>
            </View>
          )}

          {/* Note Section for BIO-FERMENT AGE DEFYING POWDER MASK */}
          {product.name === 'BIO-FERMENT AGE DEFYING POWDER MASK' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Important Note</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Note:</Text>{' '}
                  This product is dermatologically tested and safe for all skin types. For best results, use as part of your weekly skincare routine to achieve youthful, radiant skin.
                </Text>
              </View>
            </View>
          )}

          {/* Kit Components Section for EyeCell EYE ZONE CARE KIT */}
          {product.name === 'EyeCell EYE ZONE CARE KIT' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Kit Components</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Eye Contour Serum (10ml):</Text>{' '}
                  Intensive serum formulated with plant stem cell extracts and biopeptides to reduce deep wrinkles, diminish dark circles, and alleviate puffiness around the eyes.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Eye Contour Cream (20g):</Text>{' '}
                  Rich cream that targets fine lines, dark circles, and under-eye swelling while strengthening the skin's protective barrier and maintaining optimal moisture levels.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Eye Peptide Gel Patches (101g, 60 patches):</Text>{' '}
                  Innovative hydrogel patches designed to soothe and hydrate the eye area, reduce puffiness, combat dark circles, and provide a lifting effect for improved skin texture and tone.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Eye Roller Dermaroller (0.25mm):</Text>{' '}
                  Micro-needle roller specifically designed for the eye area to facilitate absorption of active ingredients and activate collagen production, enhancing overall treatment effectiveness.
                </Text>
              </View>
            </View>
          )}

          {/* Benefits Section for EyeCell EYE ZONE CARE KIT */}
          {product.name === 'EyeCell EYE ZONE CARE KIT' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Benefits</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Comprehensive Eye Care:</Text>{' '}
                  Multi-faceted approach addressing wrinkles, dark circles, and puffiness
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Advanced Ingredients:</Text>{' '}
                  Formulated with peptides, plant stem cell extracts, and hyaluronic acid
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Enhanced Absorption:</Text>{' '}
                  Micro-needle roller ensures deeper penetration of active ingredients
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Professional and Home Use:</Text>{' '}
                  Suitable for both professional treatments and daily home care
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Complete System:</Text>{' '}
                  All-in-one kit for comprehensive eye area rejuvenation
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Visible Results:</Text>{' '}
                  Delivers a more youthful, vibrant, and refreshed appearance
                </Text>
              </View>
            </View>
          )}

          {/* Note Section for EyeCell EYE ZONE CARE KIT */}
          {product.name === 'EyeCell EYE ZONE CARE KIT' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Important Note</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Note:</Text>{' '}
                  This product is dermatologically tested and safe for all skin types. Regular use can lead to a more youthful, vibrant, and refreshed appearance around the eyes. For best results, use in conjunction with other Genosys EyeCell products as part of your daily eye care regimen.
                </Text>
              </View>
            </View>
          )}

          {/* Key Features Section for GENO-LED IR II */}
          {product.name === 'GENO-LED IR II' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Key Features</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Dual Light Technology:</Text>{' '}
                  Combines infrared (IR) and red light therapy for comprehensive skin treatment and deep tissue penetration.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Professional Grade:</Text>{' '}
                  Medical-grade LED technology designed for both professional clinic use and safe home treatments.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Advanced Safety Features:</Text>{' '}
                  Built-in safety mechanisms and timer controls ensure optimal treatment duration and user safety.
                </Text>
              </View>
            </View>
          )}

          {/* Benefits Section for GENO-LED IR II */}
          {product.name === 'GENO-LED IR II' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Benefits</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Stimulates Collagen Production:</Text>{' '}
                  Red light therapy promotes natural collagen synthesis for firmer, younger-looking skin
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Reduces Inflammation:</Text>{' '}
                  Infrared light helps calm irritated skin and reduces redness and swelling
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Improves Skin Texture:</Text>{' '}
                  Regular use enhances skin smoothness and reduces fine lines and wrinkles
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Accelerates Healing:</Text>{' '}
                  Promotes faster recovery from skin treatments and reduces downtime
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Enhances Circulation:</Text>{' '}
                  Improves blood flow and oxygen delivery to skin cells
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Safe and Non-Invasive:</Text>{' '}
                  Gentle, pain-free treatment suitable for all skin types
                </Text>
              </View>
            </View>
          )}

          {/* Treatment Applications Section for GENO-LED IR II */}
          {product.name === 'GENO-LED IR II' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Treatment Applications</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Anti-Aging:</Text>{' '}
                  Reduces fine lines, wrinkles, and age spots
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Acne Treatment:</Text>{' '}
                  Helps control breakouts and reduces acne scarring
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Skin Rejuvenation:</Text>{' '}
                  Improves overall skin tone and texture
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Post-Treatment Care:</Text>{' '}
                  Enhances recovery after professional treatments
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>General Maintenance:</Text>{' '}
                  Regular use for ongoing skin health and vitality
                </Text>
              </View>
            </View>
          )}

          {/* Note Section for GENO-LED IR II */}
          {product.name === 'GENO-LED IR II' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Important Note</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Note:</Text>{' '}
                  This device is designed for professional and home use. For best results, use consistently as part of your skincare routine. Consult with a skincare professional for personalized treatment protocols.
                </Text>
              </View>
            </View>
          )}

          {/* Key Features Section for Hair-GENTRON */}
          {product.name === 'Hair-GENTRON' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Key Features</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Multi-LED Light Therapy:</Text>{' '}
                  Infrared light + Red light + Blue light combination for comprehensive scalp treatment and hair follicle stimulation.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Massaging Function:</Text>{' '}
                  Air pressure massaging system that can be used simultaneously with light therapy for enhanced treatment effectiveness.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Heating Function:</Text>{' '}
                  Optional heating feature that can be added during treatment to improve blood circulation and enhance light penetration.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Music Mode:</Text>{' '}
                  Built-in relaxation features to help users feel comfortable and relaxed during treatment sessions.
                </Text>
              </View>
            </View>
          )}

          {/* Benefits Section for Hair-GENTRON */}
          {product.name === 'Hair-GENTRON' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Benefits</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Hair Growth Stimulation:</Text>{' '}
                  Promotes natural hair growth through advanced light therapy
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Improved Blood Circulation:</Text>{' '}
                  Enhances scalp blood flow for better nutrient delivery to hair follicles
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Non-Invasive Treatment:</Text>{' '}
                  Safe and painless therapy without side effects
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Professional & Home Use:</Text>{' '}
                  Suitable for both professional clinics and home care
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Stress Relief:</Text>{' '}
                  Massaging function helps reduce tension and stress
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Optimal Light Distance:</Text>{' '}
                  Guaranteed proper distance from light source to scalp for maximum effectiveness
                </Text>
              </View>
            </View>
          )}

          {/* How It Works Section for Hair-GENTRON */}
          {product.name === 'Hair-GENTRON' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>How It Works</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Light Therapy:</Text>{' '}
                  Infrared, red, and blue LED lights stimulate hair follicles and improve scalp health
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Massaging:</Text>{' '}
                  Air pressure massaging improves blood circulation and enhances treatment effectiveness
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Heating:</Text>{' '}
                  Optional heating function increases blood flow and light penetration
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Relaxation:</Text>{' '}
                  Music mode and comfortable design ensure a pleasant treatment experience
                </Text>
              </View>
            </View>
          )}

          {/* Note Section for Hair-GENTRON */}
          {product.name === 'Hair-GENTRON' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Important Note</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Note:</Text>{' '}
                  This device is designed for professional and home use. For best results, use consistently as part of your hair care routine. Consult with a hair care professional for personalized treatment protocols.
                </Text>
              </View>
            </View>
          )}

          {/* Kit Components Section for HR³ MATRIX MESOPECIA KIT */}
          {product.name === 'HR³ MATRIX MESOPECIA KIT' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Kit Components</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>HR³ MATRIX SCALP PEELING (100ml):</Text>{' '}
                  Deep-cleansing solution that removes keratin, sebum, and impurities while providing a refreshing cooling effect for optimal scalp preparation.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>HR³ MATRIX HAIR SOLUTION (5ml x 6 vials):</Text>{' '}
                  Premium scalp and hair care product that combats factors causing hair loss, accelerates angiogenesis, and inhibits substances responsible for hair thinning.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>GENOSYS STAMP (ROLLER):</Text>{' '}
                  Specialized device designed to enhance absorption of active ingredients into the scalp, optimizing treatment effectiveness and ensuring deeper penetration.
                </Text>
              </View>
            </View>
          )}

          {/* Benefits Section for HR³ MATRIX MESOPECIA KIT */}
          {product.name === 'HR³ MATRIX MESOPECIA KIT' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Key Benefits</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Inhibits Hair Loss Causes:</Text>{' '}
                  Targets root causes including 5α-reductase inhibition to suppress DHT conversion
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Stimulates Hair Growth:</Text>{' '}
                  Supplies essential nutrients to hair follicles and promotes angiogenesis for new hair growth
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Regulates Sebum Secretion:</Text>{' '}
                  Controls excessive sebum production for balanced and healthy scalp environment
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Deep Scalp Cleansing:</Text>{' '}
                  Removes keratin, sebum, and impurities for optimal treatment absorption
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Enhanced Absorption:</Text>{' '}
                  Roller device ensures deeper penetration of active ingredients
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Comprehensive Treatment:</Text>{' '}
                  Complete system addressing all aspects of hair loss and scalp health
                </Text>
              </View>
            </View>
          )}

          {/* Treatment Protocol Section for HR³ MATRIX MESOPECIA KIT */}
          {product.name === 'HR³ MATRIX MESOPECIA KIT' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Treatment Protocol</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>1. Scalp Preparation:</Text>{' '}
                  Apply HR³ MATRIX SCALP PEELING to cleanse and prepare the scalp
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>2. Hair Parting:</Text>{' '}
                  Part the hair in the area of hair loss for targeted treatment
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>3. Roller Application:</Text>{' '}
                  Use GENOSYS STAMP (ROLLER) to gently roll or stamp the scalp
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>4. Solution Application:</Text>{' '}
                  Apply HR³ MATRIX HAIR SOLUTION using the dropper while rolling
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>5. Post-Treatment:</Text>{' '}
                  Use HR³ MATRIX Shampoo and Tonic for optimal maintenance
                </Text>
              </View>
            </View>
          )}

          {/* Key Ingredients Section for HR³ MATRIX MESOPECIA KIT */}
          {product.name === 'HR³ MATRIX MESOPECIA KIT' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Key Ingredients</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Peptide Complex:</Text>{' '}
                  Sh-polypeptide-71 supports hair follicle health and growth stimulation, Copper Tripeptide-1 promotes collagen synthesis and hair strength, Pentapeptide-20 aids in hair growth and follicle nourishment.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Botanical Extracts:</Text>{' '}
                  Sophora Japonica Bud Extract provides antioxidant properties for scalp protection, Portulaca Oleracea offers traditional herb for scalp nourishment, Polygonum Multiflorum Root is known for hair strengthening properties, Angelica Gigas Root supports scalp health and circulation.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Active Components:</Text>{' '}
                  Niacinamide improves blood circulation in the scalp, Citrus Paradisi Seed Oil provides antimicrobial benefits for scalp health, 5α-Reductase Inhibitors suppress DHT conversion to prevent hair loss.
                </Text>
              </View>
            </View>
          )}

          {/* Note Section for HR³ MATRIX MESOPECIA KIT */}
          {product.name === 'HR³ MATRIX MESOPECIA KIT' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Important Note</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Note:</Text>{' '}
                  This comprehensive kit is designed for both professional and home use. For best results, follow the complete treatment protocol and use in conjunction with HR³ MATRIX Shampoo and Tonic for optimal hair health maintenance.
                </Text>
              </View>
            </View>
          )}

          {/* Benefits Section for HR³ MATRIX SCALP PEELING α */}
          {product.name === 'HR³ MATRIX SCALP PEELING α' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Key Benefits</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Gentle Scalp Exfoliation:</Text>{' '}
                  Effectively removes keratinized particles and dead skin cells
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Refreshing Cooling Effect:</Text>{' '}
                  Provides a soothing, cooling sensation for scalp comfort
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Disinfecting Properties:</Text>{' '}
                  Helps cleanse the scalp and prepare for treatment
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Anti-Inflammatory Action:</Text>{' '}
                  Reduces inflammation and soothes irritated scalp
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Enhanced Blood Circulation:</Text>{' '}
                  Stimulates blood flow to hair follicles
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Treatment Preparation:</Text>{' '}
                  Optimizes scalp condition for microneedling procedures
                </Text>
              </View>
            </View>
          )}

          {/* Directions Section for HR³ MATRIX SCALP PEELING α */}
          {product.name === 'HR³ MATRIX SCALP PEELING α' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Directions</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>1. Scalp Preparation:</Text>{' '}
                  Ensure the scalp is clean and dry before application
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>2. Application:</Text>{' '}
                  Apply a small amount of the peeling solution to the scalp
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>3. Massage:</Text>{' '}
                  Gently massage the solution into the scalp using circular motions
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>4. Processing Time:</Text>{' '}
                  Allow the solution to work for 2-3 minutes
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>5. Rinse:</Text>{' '}
                  Thoroughly rinse with lukewarm water
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>6. Follow-up:</Text>{' '}
                  Proceed with your regular microneedling treatment protocol
                </Text>
              </View>
            </View>
          )}

          {/* Key Ingredients Section for HR³ MATRIX SCALP PEELING α */}
          {product.name === 'HR³ MATRIX SCALP PEELING α' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Key Ingredients</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Salicylic Acid:</Text>{' '}
                  Provides gentle exfoliation to remove dead skin cells and unclog hair follicles, promoting healthier scalp condition and improved treatment absorption.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Menthol:</Text>{' '}
                  Delivers a refreshing, cooling sensation that soothes the scalp and provides immediate comfort during and after application.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Sophora Japonica Linn Extract:</Text>{' '}
                  Provides antioxidant properties and helps reduce inflammation, promoting scalp health and creating an optimal environment for hair growth.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Green Tea Extract:</Text>{' '}
                  Offers anti-inflammatory and antioxidant benefits, helping to soothe the scalp and protect against environmental damage.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Grapefruit Seed Oil:</Text>{' '}
                  Provides natural antimicrobial properties to help cleanse the scalp and maintain a healthy scalp environment.
                </Text>
              </View>
            </View>
          )}

          {/* Note Section for HR³ MATRIX SCALP PEELING α */}
          {product.name === 'HR³ MATRIX SCALP PEELING α' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Important Note</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Note:</Text>{' '}
                  This product is designed for use in conjunction with microneedling treatments. For best results, use as part of the complete HR³ MATRIX treatment protocol. Avoid contact with eyes and discontinue use if irritation occurs.
                </Text>
              </View>
            </View>
          )}

          {/* Benefits Section for HR³ MATRIX HAIR SOLUTION α */}
          {product.name === 'HR³ MATRIX HAIR SOLUTION α' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Key Benefits</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Hair Loss Prevention:</Text>{' '}
                  Targets root causes including 5α-reductase inhibition to suppress DHT conversion
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Stimulates Hair Growth:</Text>{' '}
                  Supplies essential nutrients to hair follicles and promotes angiogenesis for new hair growth
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Regulates Sebum Secretion:</Text>{' '}
                  Controls excessive sebum production for balanced and healthy scalp environment
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Enhanced Absorption:</Text>{' '}
                  Designed to work with roller device for deeper penetration of active ingredients
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Comprehensive Treatment:</Text>{' '}
                  Addresses all aspects of hair loss and scalp health
                </Text>
              </View>
            </View>
          )}

          {/* Benefits Section for HR³ MATRIX SCALP SHAMPOO α */}
          {product.name === 'HR³ MATRIX SCALP SHAMPOO α' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Key Benefits</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Hair Loss Prevention:</Text>{' '}
                  KFDA-approved functional product designed to improve hair loss conditions
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Scalp Cooling:</Text>{' '}
                  Helps cool down scalp heat and provides refreshing sensation
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Sebum Control:</Text>{' '}
                  Controls excess sebum production for balanced scalp environment
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Optimal Hair Growth:</Text>{' '}
                  Creates an optimal environment for healthy hair growth
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Advanced Formula:</Text>{' '}
                  Patented ingredient complex with proven effectiveness
                </Text>
              </View>
            </View>
          )}

          {/* Benefits Section for HR³ MATRIX HAIR TONIC α */}
          {product.name === 'HR³ MATRIX HAIR TONIC α' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Key Benefits</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Scalp Health:</Text>{' '}
                  Provides essential nutrients to maintain healthy scalp condition
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Hair Growth Support:</Text>{' '}
                  Supports healthy hair growth through advanced ingredient complex
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Circulation Improvement:</Text>{' '}
                  Improves blood circulation in the scalp for better nutrient delivery
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Treatment Protocol:</Text>{' '}
                  Part of comprehensive HR³ MATRIX treatment system
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Professional & Home Use:</Text>{' '}
                  Suitable for both professional treatments and daily home care
                </Text>
              </View>
            </View>
          )}

          {/* Benefits Section for HR³ MATRIX SCALP AMPOULE α */}
          {product.name === 'HR³ MATRIX SCALP AMPOULE α' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Key Benefits</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Intensive Hair Loss Prevention:</Text>{' '}
                  High concentration of active ingredients for maximum effectiveness
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Hair Follicle Stimulation:</Text>{' '}
                  Promotes hair growth and strengthens existing hair follicles
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Scalp Rejuvenation:</Text>{' '}
                  Improves scalp health and creates optimal conditions for hair growth
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Concentrated Formula:</Text>{' '}
                  Delivers maximum benefits with minimal application
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Professional & Home Use:</Text>{' '}
                  Suitable for both professional treatments and daily home care
                </Text>
              </View>
            </View>
          )}

          {/* Benefits Section for HR³ MATRIX SCALP ROLLER α */}
          {product.name === 'HR³ MATRIX SCALP ROLLER α' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Key Benefits</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Enhanced Absorption:</Text>{' '}
                  Improves penetration of active ingredients into the scalp
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Deeper Penetration:</Text>{' '}
                  Ensures active ingredients reach deeper layers of the scalp
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Treatment Optimization:</Text>{' '}
                  Maximizes the effectiveness of scalp treatments
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Professional Grade:</Text>{' '}
                  Medical-grade microneedling technology for optimal results
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Safe & Effective:</Text>{' '}
                  Designed for safe use in both professional and home settings
                </Text>
              </View>
            </View>
          )}

          {/* Color Selection Section for HR³ MATRIX SCALP ROLLER α */}
          {product.name === 'HR³ MATRIX SCALP ROLLER α' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Available Colors</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Black:</Text>{' '}
                  Professional black finish for clinical and home use
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>White:</Text>{' '}
                  Clean white finish for professional clinic environments
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Pink:</Text>{' '}
                  Elegant pink finish for personal home care use
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Blue:</Text>{' '}
                  Modern blue finish for contemporary styling
                </Text>
              </View>
            </View>
          )}

          {/* Benefits Section for HR³ MATRIX SCALP BRUSH α */}
          {product.name === 'HR³ MATRIX SCALP BRUSH α' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Key Benefits</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Improved Circulation:</Text>{' '}
                  Stimulates blood flow to the scalp for better nutrient delivery
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Therapeutic Massage:</Text>{' '}
                  Provides relaxing massage benefits while distributing treatments
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Even Distribution:</Text>{' '}
                  Ensures active ingredients are spread evenly across the scalp
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Professional Quality:</Text>{' '}
                  Medical-grade brush designed for optimal scalp care
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Easy to Use:</Text>{' '}
                  Simple and comfortable to use for daily scalp care
                </Text>
              </View>
            </View>
          )}

          {/* Benefits Section for HR³ MATRIX SCALP KIT α */}
          {product.name === 'HR³ MATRIX SCALP KIT α' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Key Benefits</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Comprehensive Treatment:</Text>{' '}
                  Complete system addressing all aspects of scalp health
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Professional Care:</Text>{' '}
                  Medical-grade components for professional treatment results
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Hair Restoration:</Text>{' '}
                  Advanced system for hair loss prevention and regrowth
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Multi-Component:</Text>{' '}
                  Multiple treatment components for comprehensive care
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Advanced Technology:</Text>{' '}
                  Latest scalp treatment technology for optimal results
                </Text>
              </View>
            </View>
          )}

          {/* Benefits Section for HR³ MATRIX SCALP HOME CARE KIT α */}
          {product.name === 'HR³ MATRIX SCALP HOME CARE KIT α' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Key Benefits</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Professional-Grade Treatments:</Text>{' '}
                  Clinic-quality treatments in the comfort of your home
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Daily Care:</Text>{' '}
                  Complete system for consistent daily scalp care
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Hair Loss Prevention:</Text>{' '}
                  Comprehensive approach to preventing hair loss
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Convenience:</Text>{' '}
                  All necessary components in one convenient kit
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Cost-Effective:</Text>{' '}
                  Professional treatments without the cost of clinic visits
                </Text>
              </View>
            </View>
          )}

          {/* Benefits Section for SKIN CARING BLEMISH BALM CUSHION */}
          {product.name === 'SKIN CARING BLEMISH BALM CUSHION [SPF 50+ PA++++]' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Key Benefits</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Post-Treatment Coverage:</Text>{' '}
                  BB cushion that can be used after professional treatment
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Convenient Application:</Text>{' '}
                  Convenient and quick base makeup in the morning
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Environmental Protection:</Text>{' '}
                  Skin protection from harmful environment
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Sun Protection:</Text>{' '}
                  SPF 50 / PA++++ for comprehensive sun protection
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Skin Coverage:</Text>{' '}
                  Natural coverage with skin cover up benefits
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Natural Glow:</Text>{' '}
                  60% moisture essence enables natural and healthy glow
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Skin Calming:</Text>{' '}
                  40% peptide complex helps calm irritated skin
                </Text>
              </View>
            </View>
          )}


          {/* Directions Section for SKIN CARING BLEMISH BALM CUSHION */}
          {product.name === 'SKIN CARING BLEMISH BALM CUSHION [SPF 50+ PA++++]' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Directions</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Application:</Text>{' '}
                  Press the puff lightly onto cushion and pat evenly onto skin
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Technique:</Text>{' '}
                  We recommend patting the puff gently on the skin several times to enhance the long-lasting effect
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Best Results:</Text>{' '}
                  Apply after professional treatments for optimal coverage and skin protection
                </Text>
              </View>
            </View>
          )}

          {/* Key Ingredients Section for SKIN CARING BLEMISH BALM CUSHION */}
          {product.name === 'SKIN CARING BLEMISH BALM CUSHION [SPF 50+ PA++++]' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Key Ingredients</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Repairing Pep9 Complex:</Text>{' '}
                  Promotion of collagen induction and skin regeneration with Hexapeptide-9, Copper Tripeptide-1, Palmitoyl Pentapeptide-4, Palmitoyl Tripeptide-1, Hexapeptide-11, Tripeptide-1, and Alanine/Histidine/Lysine Polypeptide Copper HCl. Includes Acetyl Hexapeptide-8 for firming and Nonapeptide-1 for skin brightening.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Volufiline™:</Text>{' '}
                  Sarsasapogenin from anemarrhena asphodeloides root. It provides a volume-enhancing benefit by a cosmetic lipofilling-like effect. And as rich in saponin, it has anti-inflammatory and antioxidant features.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Glutathione:</Text>{' '}
                  As a powerful antioxidant, it helps brighten and even skin by blocking the tyrosinase activity. And it also has a beneficial effect for cystic acne or even the occasional breakout.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Moisture Essence (60%):</Text>{' '}
                  High concentration of moisture essence enables natural and healthy glow while providing deep hydration.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Peptide Complex (40%):</Text>{' '}
                  Various peptide complex helps calm irritated skin and provides skin regeneration benefits.
                </Text>
              </View>
            </View>
          )}

          {/* Note Section for SKIN CARING BLEMISH BALM CUSHION */}
          {product.name === 'SKIN CARING BLEMISH BALM CUSHION [SPF 50+ PA++++]' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Important Note</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Note:</Text>{' '}
                  This product is dermatologically tested and safe for all skin types. For best results, use as part of your daily skincare routine.
                </Text>
              </View>
            </View>
          )}

          {/* Key Features Section for Microneedle Roller */}
          {product.name === 'Microneedle Roller' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Key Features</Text>
              <View style={[styles.detailsList, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>
                    Patented DTS Technology:
                  </Text>{' '}
                  Diskneedle Therapy System ensures safe and effective
                  treatments with reduced recovery time.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Ultra-Thin Needles:</Text>{' '}
                  450 needles per unit, 25% thinner than other brands for
                  enhanced comfort and effectiveness.
                </Text>
                <Text style={[styles.detailItem, { color: theme.colors.text }]}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Professional Grade:</Text>{' '}
                  Manufactured in South Korea with precision engineering for
                  professional use.
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <ProductActions
        product={product}
        selectedSize={selectedSize}
        selectedColor={selectedColor}
        currentPrice={currentPrice}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButtonText: {
    color: '#6b7280',
    fontSize: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  descriptionBlock: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  detailsList: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  detailItem: {
    marginBottom: 12,
    lineHeight: 20,
  },
  detailLabel: {
    fontWeight: '600',
  },
  colorSelectionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  colorOption: {
    width: '30%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    minHeight: 120,
    justifyContent: 'center',
  },
  colorSwatch: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  colorLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
    minHeight: 20,
  },
  colorDescription: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
    minHeight: 28,
    flexWrap: 'wrap',
  },
  selectionIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
