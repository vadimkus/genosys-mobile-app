import { Product } from '../types';

export interface ProductDetail {
  label: string;
  value: string;
}

export interface ProductDetailsConfig {
  productNamePattern: string;
  details: ProductDetail[];
}

export const PRODUCT_DETAILS_CONFIG: ProductDetailsConfig[] = [
  {
    productNamePattern: 'intensive hydro soothing cream',
    details: [
      { label: 'Type', value: 'Intensive hydro soothing cream' },
      { label: 'Size Options', value: '50g (Homecare) / 250g (Professional)' },
      {
        label: 'Key Benefits',
        value: 'Hydration, soothing, skin repair, barrier protection',
      },
      {
        label: 'Skin Type',
        value: 'All skin types, especially sensitive and irritated skin',
      },
      { label: 'Usage', value: 'Professional and home care' },
      { label: 'Country of Origin', value: 'South Korea' },
    ],
  },
  {
    productNamePattern: 'multi functional anti-wrinkle cream',
    details: [
      { label: 'Form', value: 'Multi-functional anti-wrinkle cream' },
      { label: 'Size', value: '50g (Homecare) / 250g (Professional)' },
      { label: 'Target', value: 'Anti-aging and wrinkle reduction' },
      {
        label: 'Technology',
        value: 'Advanced anti-aging formula with multi-functional benefits',
      },
      {
        label: 'Key Benefits',
        value:
          'Wrinkle reduction, firming, collagen synthesis, antioxidant protection',
      },
      { label: 'Usage', value: 'Morning and/or evening application' },
      { label: 'Skin Type', value: 'All skin types, especially mature skin' },
      {
        label: 'Formulation',
        value: 'Advanced anti-aging cream with multi-functional benefits',
      },
      { label: 'Country of Origin', value: 'South Korea' },
    ],
  },
  {
    productNamePattern: 'multi functional anti-wrinkle serum',
    details: [
      { label: 'Type', value: 'Multi-functional anti-wrinkle serum' },
      { label: 'Size', value: '30ml' },
      {
        label: 'Key Benefits',
        value: 'Wrinkle reduction, skin firmness, anti-aging',
      },
      {
        label: 'Skin Type',
        value: 'All skin types, especially aging and mature skin',
      },
      { label: 'Usage', value: 'Daily anti-aging treatment' },
      {
        label: 'Clinical Testing',
        value: 'Clinically tested for efficacy and safety',
      },
      { label: 'Country of Origin', value: 'South Korea' },
    ],
  },
  {
    productNamePattern: 'multi sun cream',
    details: [
      { label: 'Type', value: 'Daily sunscreen with SPF 40 PA++' },
      { label: 'Size', value: '40g' },
      { label: 'Protection', value: 'UVA/UVB protection, SPF 40, PA++' },
      { label: 'Skin Type', value: 'All skin types, including sensitive skin' },
      { label: 'Usage', value: 'Daily sun protection, outdoor activities' },
      { label: 'Country of Origin', value: 'South Korea' },
    ],
  },
  {
    productNamePattern: 'ultra shield sun cream',
    details: [
      { label: 'Form', value: 'Daily sunscreen with sunburn care' },
      { label: 'Size', value: '50g' },
      { label: 'Protection', value: 'SPF 50+ PA++++' },
      { label: 'Target', value: 'UV protection and sunburn care' },
      { label: 'Technology', value: 'MicroHA™ and ProbioMETA™ technology' },
      {
        label: 'Key Benefits',
        value:
          'UV protection, sunburn care, skin recovery, reef-safe protection',
      },
      { label: 'Usage', value: 'Daily sun protection, reapply every 2 hours' },
      { label: 'Skin Type', value: 'All skin types' },
      {
        label: 'Application',
        value: 'Apply generously to all exposed skin areas',
      },
      {
        label: 'Formulation',
        value: 'Non-greasy, silky texture with tropical antioxidant complex',
      },
      { label: 'Country of Origin', value: 'South Korea' },
    ],
  },
  {
    productNamePattern: 'nd cell anti-wrinkle cream',
    details: [
      { label: 'Form', value: 'Specialized anti-aging cream' },
      { label: 'Size', value: '50g' },
      { label: 'Target', value: 'Neck and décolleté area anti-aging' },
      {
        label: 'Technology',
        value: 'Advanced peptide complex with vitamin blend',
      },
      {
        label: 'Key Benefits',
        value: 'Lifting, firming, depigmentation, texture refinement',
      },
      {
        label: 'Usage',
        value: 'Daily anti-aging treatment, morning and evening',
      },
      {
        label: 'Skin Type',
        value: 'All skin types, especially aging neck and décolleté',
      },
      { label: 'Application', value: 'Apply to clean neck and décolleté area' },
      {
        label: 'Testing',
        value: 'Dermatologically tested and clinically proven',
      },
      { label: 'Country of Origin', value: 'South Korea' },
    ],
  },
  {
    productNamePattern: 'barrier strengthening cream',
    details: [
      { label: 'Form', value: 'Skin barrier strengthening cream' },
      { label: 'Size', value: '100g' },
      { label: 'Target', value: 'Barrier protection and repair' },
      {
        label: 'Technology',
        value: 'MultiEx BSASM® Plus with ceramide and amino acid complex',
      },
      {
        label: 'Key Benefits',
        value:
          'Barrier protection, moisture retention, skin softening, water retention promotion',
      },
      {
        label: 'Usage',
        value: 'Daily barrier protection and repair, morning and evening',
      },
      {
        label: 'Skin Type',
        value: 'All skin types, especially compromised and sensitive skin',
      },
      {
        label: 'Application',
        value: 'Apply to clean skin, focus on dry or damaged areas',
      },
      { label: 'Country of Origin', value: 'South Korea' },
    ],
  },
  {
    productNamePattern: 'needle pen-k',
    details: [
      { label: 'Form', value: 'Professional automatic microneedling device' },
      { label: 'Size', value: '1 Device' },
      {
        label: 'Target',
        value: 'Collagen production and transdermal nutrient delivery',
      },
      {
        label: 'Technology',
        value: 'Automatic microneedling with adjustable depth and speed',
      },
      {
        label: 'Key Benefits',
        value:
          'Collagen production, enhanced absorption, skin rejuvenation, micro-channel creation',
      },
      {
        label: 'Usage',
        value: 'Professional and home use, controlled micro-injuries',
      },
      {
        label: 'Skin Type',
        value: 'All skin types, especially aging and textured skin',
      },
      {
        label: 'Application',
        value: 'Creates micro-channels for enhanced ingredient absorption',
      },
      {
        label: 'Safety',
        value: 'Professional-grade device with controlled penetration',
      },
      { label: 'Country of Origin', value: 'South Korea' },
    ],
  },
  {
    productNamePattern: 'intensive repair collagen mask',
    details: [
      { label: 'Form', value: 'Professional thermo-sensitive hydrogel mask' },
      { label: 'Size', value: '38g x 5ea' },
      { label: 'Target', value: 'Post-treatment care and cooling therapy' },
      {
        label: 'Technology',
        value: 'Thermo-sensitive hydrogel with collagen and cooling agents',
      },
      {
        label: 'Key Benefits',
        value:
          'Cooling therapy, collagen delivery, post-treatment care, skin soothing',
      },
      {
        label: 'Usage',
        value: 'Post-treatment application, cooling therapy sessions',
      },
      {
        label: 'Skin Type',
        value: 'All skin types, especially post-treatment skin',
      },
      {
        label: 'Application',
        value: 'Apply after treatments for cooling and collagen delivery',
      },
      { label: 'Country of Origin', value: 'South Korea' },
    ],
  },
  {
    productNamePattern: 'hydro cool modeling mask',
    details: [
      { label: 'Form', value: 'Professional modeling mask' },
      { label: 'Size', value: '1kg' },
      { label: 'Target', value: 'Post-treatment skin soothing and hydration' },
      {
        label: 'Technology',
        value: 'Advanced cooling and hydrating formula',
      },
      {
        label: 'Key Benefits',
        value: 'Cooling effect, hydration, pore minimizing, skin soothing',
      },
      {
        label: 'Usage',
        value: 'Professional and home care',
      },
      {
        label: 'Skin Type',
        value: 'All skin types',
      },
      {
        label: 'Application',
        value: 'Apply evenly to face, leave for 15-20 minutes, then rinse',
      },
      { label: 'Country of Origin', value: 'South Korea' },
    ],
  },
  {
    productNamePattern: 'hair-gentron',
    details: [
      { label: 'Type', value: 'LED helmet with massaging and heating functions' },
      { label: 'Size', value: '1 Device' },
      { label: 'Patent', value: 'No. 10-2151442 (Korea)' },
      { label: 'Award', value: 'Bronze medal winner of 2020 Korea invention patent competition' },
      {
        label: 'Light Types',
        value: 'Infrared + Red + Blue LED combination',
      },
      {
        label: 'Features',
        value: 'Massaging, heating, music mode',
      },
      {
        label: 'Usage',
        value: 'Professional and home care',
      },
      { label: 'Country of Origin', value: 'South Korea' },
    ],
  },
  {
    productNamePattern: 'hairgen booster',
    details: [
      { label: 'Type', value: 'Auto-microneedling LED device for scalp treatment' },
      { label: 'Size', value: '1 Device' },
      {
        label: 'Technology',
        value: 'Microneedling + LED light therapy',
      },
      {
        label: 'Key Components',
        value: 'HR³ MATRIX HAIR SOLUTION α + HR³ MATRIX HAIR STAMP',
      },
      {
        label: 'Benefits',
        value: 'Hair growth stimulation, scalp health improvement, nutrient delivery',
      },
      {
        label: 'Usage',
        value: 'Professional and home care',
      },
      { label: 'Country of Origin', value: 'South Korea' },
    ],
  },
];

export class ProductDetailsService {
  static getProductDetails(product: Product): ProductDetail[] {
    const productName = product.name.toLowerCase();

    const config = PRODUCT_DETAILS_CONFIG.find(config =>
      productName.includes(config.productNamePattern)
    );

    if (!config) {
      // Return default details if no specific config found
      return [
        { label: 'Type', value: product.name },
        { label: 'Brand', value: product.brand },
        { label: 'Price', value: `AED ${product.price.toFixed(2)}` },
        { label: 'Country of Origin', value: 'South Korea' },
      ];
    }

    return config.details;
  }

  static hasCustomDetails(product: Product): boolean {
    const productName = product.name.toLowerCase();
    return PRODUCT_DETAILS_CONFIG.some(config =>
      productName.includes(config.productNamePattern)
    );
  }
}
