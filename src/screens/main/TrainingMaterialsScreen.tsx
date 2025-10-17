import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { typography } from '../../constants/typography';

const { width } = Dimensions.get('window');

type TrainingMaterialsScreenNavigationProp =
  StackNavigationProp<RootStackParamList>;

interface TrainingDocument {
  id: string;
  title: string;
  size: string;
  url: string;
  category: string;
  description: string;
}

export default function TrainingMaterialsScreen() {
  const navigation = useNavigation<TrainingMaterialsScreenNavigationProp>();
  const { theme } = useTheme();
  const [downloading, setDownloading] = useState<string | null>(null);

  const trainingDocuments: TrainingDocument[] = [
    // Training Documents
    {
      id: '1',
      title: 'Product Catalogue 2026',
      size: '235.5 MB',
      url: 'https://u.pcloud.link/publink/show?code=XZ9wc15ZDTFcM6uvKg0snY1dEJwzwQgHsEF7',
      category: 'Training Documents',
      description: 'Complete product catalogue with all Genosys products',
    },
    {
      id: '2',
      title: 'Home Care Guide 2026',
      size: '9.8 MB',
      url: 'https://genosys.ae/documents/Genosys-Home-Care-Guide.pdf',
      category: 'Training Documents',
      description: 'Comprehensive home care treatment guide',
    },
    {
      id: '3',
      title: 'Professional Manual 2026',
      size: '10.4 MB',
      url: 'https://genosys.ae/documents/Genosys-Professional-Manual.pdf',
      category: 'Training Documents',
      description: 'Professional treatment protocols and procedures',
    },
    {
      id: '4',
      title: 'Facial Treatment Homecare 2026',
      size: '8.2 MB',
      url: 'https://genosys.ae/training/facial-treatment-homecare-2026.pdf',
      category: 'Training Documents',
      description: 'Home facial treatment techniques and protocols',
    },
    {
      id: '5',
      title: 'Facial Treatment Professional 2026',
      size: '8.2 MB',
      url: 'https://genosys.ae/training/facial-treatment-professional-2026.pdf',
      category: 'Training Documents',
      description: 'Professional facial treatment procedures',
    },
    // Product Documentation
    {
      id: '6',
      title: 'MULTI VITA RADIANCE CREAM',
      size: '2.1 MB',
      url: 'https://genosys.ae/training/multi-vita-radiance-cream.pdf',
      category: 'Product Documentation',
      description: 'Multi vitamin radiance cream documentation',
    },
    {
      id: '7',
      title: 'EyeCell EYE ZONE CARE SYSTEM',
      size: '1.8 MB',
      url: 'https://genosys.ae/training/eyecell-eye-zone-care-system.pdf',
      category: 'Product Documentation',
      description: 'Eye zone care system treatment guide',
    },
    {
      id: '8',
      title: 'EPI TURNOVER BOOSTING PEELING GEL',
      size: '3.8 MB',
      url: 'https://genosys.ae/training/epi-turnover-boosting-peeling-gel.pdf',
      category: 'Product Documentation',
      description: 'Epi turnover boosting peeling gel protocols',
    },
    {
      id: '9',
      title: 'MULTI VITA RADIANCE SERUM',
      size: '1.5 MB',
      url: 'https://genosys.ae/training/multi-vita-radiance-serum.pdf',
      category: 'Product Documentation',
      description: 'Multi vitamin radiance serum documentation',
    },
    {
      id: '10',
      title: 'SKIN DEFENDER LIP & EYE MAKEUP REMOVER',
      size: '0.7 MB',
      url: 'https://genosys.ae/training/skin-defender-lip-eye-makeup-remover.pdf',
      category: 'Product Documentation',
      description: 'Skin defender makeup remover guide',
    },
    {
      id: '11',
      title: 'MICROBIOME ENERGY INFUSING MIST',
      size: '0.8 MB',
      url: 'https://genosys.ae/training/microbiome-energy-infusing-mist.pdf',
      category: 'Product Documentation',
      description: 'Microbiome energy infusing mist protocols',
    },
    {
      id: '12',
      title: 'SKIN RESCUE OVERNIGHT CREAM MASK',
      size: '1.3 MB',
      url: 'https://genosys.ae/training/skin-rescue-overnight-cream-mask.pdf',
      category: 'Product Documentation',
      description: 'Skin rescue overnight mask treatment guide',
    },
    {
      id: '13',
      title: 'INTENSIVE PROBLEM CONTROL TONER',
      size: '1.0 MB',
      url: 'https://genosys.ae/training/intensive-problem-control-toner.pdf',
      category: 'Product Documentation',
      description: 'Intensive problem control toner protocols',
    },
    {
      id: '14',
      title: 'ULTRA SHIELD SUN CREAM',
      size: '0.6 MB',
      url: 'https://genosys.ae/training/ultra-shield-sun-cream.pdf',
      category: 'Product Documentation',
      description: 'Ultra shield sun cream application guide',
    },
    {
      id: '15',
      title: 'HR³ MATRIX SCALP SHAMPOO α',
      size: '2.3 MB',
      url: 'https://genosys.ae/training/hr3-matrix-scalp-shampoo-alpha.pdf',
      category: 'Product Documentation',
      description: 'HR³ matrix scalp shampoo treatment protocols',
    },
    {
      id: '16',
      title: 'MOISTURE REPLENISHING HYALURON SERUM',
      size: '1.9 MB',
      url: 'https://genosys.ae/training/moisture-replenishing-hyaluron-serum.pdf',
      category: 'Product Documentation',
      description: 'Moisture replenishing hyaluron serum guide',
    },
    {
      id: '17',
      title: 'MOISTURE REPLENISHING HYALURON CREAM',
      size: '2.0 MB',
      url: 'https://genosys.ae/training/moisture-replenishing-hyaluron-cream.pdf',
      category: 'Product Documentation',
      description: 'Moisture replenishing hyaluron cream protocols',
    },
    {
      id: '18',
      title: 'SKIN CARING BLEMISH BALM CUSHION',
      size: '1.2 MB',
      url: 'https://genosys.ae/training/skin-caring-blemish-balm-cushion.pdf',
      category: 'Product Documentation',
      description: 'Skin caring blemish balm cushion application',
    },
    {
      id: '19',
      title: 'EyeCell EYE PEPTIDE GEL PATCH',
      size: '1.4 MB',
      url: 'https://genosys.ae/training/eyecell-eye-peptide-gel-patch.pdf',
      category: 'Product Documentation',
      description: 'EyeCell eye peptide gel patch treatment',
    },
    {
      id: '20',
      title: 'BIO-FERMENT AGE DEFYING POWDER MASK',
      size: '2.1 MB',
      url: 'https://genosys.ae/training/bio-ferment-age-defying-powder-mask.pdf',
      category: 'Product Documentation',
      description: 'Bio-ferment age defying powder mask protocols',
    },
    {
      id: '21',
      title: 'HAIR GENTRON',
      size: '1.8 MB',
      url: 'https://genosys.ae/training/hair-gentron.pdf',
      category: 'Product Documentation',
      description: 'Hair Gentron device treatment guide',
    },
    {
      id: '22',
      title: 'HR³ MATRIX HAIR SOLUTION α',
      size: '2.3 MB',
      url: 'https://genosys.ae/training/hr3-matrix-hair-solution-alpha.pdf',
      category: 'Product Documentation',
      description: 'HR³ matrix hair solution treatment protocols',
    },
    {
      id: '23',
      title: 'HR³ MATRIX HAIR TONIC α',
      size: '1.9 MB',
      url: 'https://genosys.ae/training/hr3-matrix-hair-tonic-alpha.pdf',
      category: 'Product Documentation',
      description: 'HR³ matrix hair tonic application guide',
    },
    {
      id: '24',
      title: 'HR³ MATRIX SCALP PEELING α',
      size: '2.1 MB',
      url: 'https://genosys.ae/training/hr3-matrix-scalp-peeling-alpha.pdf',
      category: 'Product Documentation',
      description: 'HR³ matrix scalp peeling treatment protocols',
    },
    {
      id: '25',
      title: 'GENO-LED IR II',
      size: '4.6 MB',
      url: 'https://genosys.ae/training/geno-led-ir-ii.pdf',
      category: 'Product Documentation',
      description: 'Geno LED IR II device treatment guide',
    },
    {
      id: '26',
      title: 'SKIN REBOOT PDRN MASK PACK',
      size: '1.2 MB',
      url: 'https://genosys.ae/training/skin-reboot-pdrn-mask-pack.pdf',
      category: 'Product Documentation',
      description: 'Skin reboot PDRN mask pack protocols',
    },
    {
      id: '27',
      title: 'EZ CO₂ MASK KIT',
      size: '0.5 MB',
      url: 'https://genosys.ae/training/ez-co2-mask-kit.pdf',
      category: 'Product Documentation',
      description: 'EZ CO₂ mask kit treatment guide',
    },
    {
      id: '28',
      title: 'Microneedle Roller',
      size: '1.5 MB',
      url: 'https://genosys.ae/training/microneedle-roller.pdf',
      category: 'Product Documentation',
      description: 'Microneedle roller treatment protocols',
    },
  ];

  const handleDownload = async (document: TrainingDocument) => {
    setDownloading(document.id);

    try {
      // Check if this is a direct download link (like pCloud)
      const isDirectLink =
        document.url.includes('pcloud.link') || document.url.includes('.pdf');

      if (isDirectLink) {
        // Try to open the direct link first
        const supported = await Linking.canOpenURL(document.url);
        if (supported) {
          await Linking.openURL(document.url);
          Alert.alert(
            'Opening Document',
            `${document.title} (${document.size}) is opening in your browser.`,
            [{ text: 'OK' }]
          );
        } else {
          throw new Error('Cannot open direct link');
        }
      } else {
        // For other links, open the training page
        await Linking.openURL('https://genosys.ae/training');
        Alert.alert(
          'Opening Training Page',
          `Opening the Genosys training page. Look for "${document.title}" (${document.size}) in the available documents section.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      // Fallback to training page if direct link fails
      try {
        await Linking.openURL('https://genosys.ae/training');
        Alert.alert(
          'Opening Training Page',
          `Could not open direct link. Opening the Genosys training page where you can find "${document.title}".`,
          [{ text: 'OK' }]
        );
      } catch (fallbackError) {
        Alert.alert(
          'Error',
          'Unable to open the document. Please check your internet connection and try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setDownloading(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Training Documents':
        return 'school-outline';
      case 'Product Documentation':
        return 'document-text-outline';
      default:
        return 'document-outline';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Training Documents':
        return '#dc2626';
      case 'Product Documentation':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const groupedDocuments = trainingDocuments.reduce(
    (acc, doc) => {
      if (!acc[doc.category]) {
        acc[doc.category] = [];
      }
      acc[doc.category].push(doc);
      return acc;
    },
    {} as Record<string, TrainingDocument[]>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.centerContainer}>
            <Image
              source={require('../../../login/Logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text
              style={[styles.subtitle, { color: theme.colors.textSecondary }]}
            >
              Training Materials
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {Object.entries(groupedDocuments).map(([category, documents]) => (
          <View key={category} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Ionicons
                name={getCategoryIcon(category) as any}
                size={20}
                color={getCategoryColor(category)}
              />
              <Text
                style={[styles.categoryTitle, { color: theme.colors.text }]}
              >
                {category}
              </Text>
              <Text
                style={[
                  styles.categoryCount,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {documents.length} files
              </Text>
            </View>

            {documents.map(document => (
              <TouchableOpacity
                key={document.id}
                style={[
                  styles.documentItem,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() => handleDownload(document)}
                disabled={downloading === document.id}
              >
                <View style={styles.documentLeft}>
                  <View
                    style={[
                      styles.documentIcon,
                      { backgroundColor: getCategoryColor(category) + '20' },
                    ]}
                  >
                    <Ionicons
                      name='document-outline'
                      size={20}
                      color={getCategoryColor(category)}
                    />
                  </View>
                  <View style={styles.documentInfo}>
                    <Text
                      style={[
                        styles.documentTitle,
                        { color: theme.colors.text },
                      ]}
                    >
                      {document.title}
                    </Text>
                    <Text
                      style={[
                        styles.documentDescription,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      {document.description}
                    </Text>
                    <Text
                      style={[
                        styles.documentSize,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      {document.size}
                    </Text>
                  </View>
                </View>

                <View style={styles.documentRight}>
                  {downloading === document.id ? (
                    <ActivityIndicator size='small' color='#dc2626' />
                  ) : (
                    <Ionicons
                      name='download-outline'
                      size={20}
                      color='#dc2626'
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <View style={styles.footer}>
          <Text
            style={[styles.footerText, { color: theme.colors.textSecondary }]}
          >
            All training materials are provided by Genosys Middle East FZ-LLC
          </Text>
          <Text
            style={[styles.footerText, { color: theme.colors.textSecondary }]}
          >
            Official Distributor in the UAE
          </Text>
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
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 95,
    height: 63,
  },
  subtitle: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 20,
    textAlign: 'center',
    marginTop: -8,
  },
  scrollView: {
    flex: 1,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  categoryCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  documentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  documentDescription: {
    fontSize: 12,
    marginBottom: 4,
  },
  documentSize: {
    fontSize: 11,
    fontWeight: '500',
  },
  documentRight: {
    padding: 8,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 4,
  },
});
