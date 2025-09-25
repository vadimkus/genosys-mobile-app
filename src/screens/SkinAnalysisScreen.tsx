import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface SkinType {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  recommendedProducts: string[];
  icon: string;
}

export default function SkinAnalysisScreen() {
  const navigation = useNavigation();
  const [selectedSkinType, setSelectedSkinType] = useState<string | null>(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const skinTypes: SkinType[] = [
    {
      id: 'normal',
      name: 'Normal Skin',
      description: 'Well-balanced skin with minimal imperfections',
      characteristics: ['Even texture', 'Small pores', 'No sensitivity', 'Good circulation'],
      recommendedProducts: ['MULTI VITA RADIANCE CREAM', 'EyeCell EYE ZONE CARE'],
      icon: '✨'
    },
    {
      id: 'dry',
      name: 'Dry Skin',
      description: 'Skin that lacks moisture and may feel tight',
      characteristics: ['Tight feeling', 'Flaky patches', 'Dull appearance', 'Fine lines'],
      recommendedProducts: ['MOISTURE REPLENISHING HYALURON CREAM', 'SKIN RESCUE OVERNIGHT CREAM MASK'],
      icon: '🌵'
    },
    {
      id: 'oily',
      name: 'Oily Skin',
      description: 'Skin that produces excess sebum',
      characteristics: ['Shiny appearance', 'Large pores', 'Prone to breakouts', 'Thick texture'],
      recommendedProducts: ['EPI TURNOVER BOOSTING PEELING GEL', 'INTENSIVE PROBLEM CONTROL TONER'],
      icon: '💧'
    },
    {
      id: 'combination',
      name: 'Combination Skin',
      description: 'Mix of oily and dry areas',
      characteristics: ['Oily T-zone', 'Dry cheeks', 'Variable texture', 'Mixed concerns'],
      recommendedProducts: ['MULTI VITA RADIANCE SERUM', 'SKIN CARING BLEMISH BALM CUSHION'],
      icon: '⚖️'
    },
    {
      id: 'sensitive',
      name: 'Sensitive Skin',
      description: 'Skin that reacts easily to products and environment',
      characteristics: ['Redness', 'Irritation', 'Burning sensation', 'Reactive to changes'],
      recommendedProducts: ['MICROBIOME ENERGY INFUSING MIST', 'ULTRA SHIELD SUN CREAM'],
      icon: '🌹'
    },
    {
      id: 'mature',
      name: 'Mature Skin',
      description: 'Skin showing signs of aging',
      characteristics: ['Fine lines', 'Loss of firmness', 'Age spots', 'Dullness'],
      recommendedProducts: ['BIO-FERMENT AGE DEFYING POWDER MASK', 'GENO-LED IR II'],
      icon: '👑'
    }
  ];

  const handleSkinTypeSelect = (skinTypeId: string) => {
    setSelectedSkinType(skinTypeId);
  };

  const handleCompleteAnalysis = () => {
    if (!selectedSkinType) {
      Alert.alert('Please Select', 'Please select your skin type to continue.');
      return;
    }
    setAnalysisComplete(true);
    Alert.alert(
      'Analysis Complete!',
      'Your skin analysis has been saved. You can now view personalized product recommendations.',
      [
        { text: 'View Recommendations', onPress: () => navigation.navigate('Products' as never) },
        { text: 'OK' }
      ]
    );
  };

  const selectedSkin = skinTypes.find(skin => skin.id === selectedSkinType);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Skin Analysis</Text>
          <Text style={styles.subtitle}>Discover your skin type and get personalized recommendations</Text>
        </View>
      </View>

      {/* Analysis Progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Skin Health Analysis</Text>
            <Text style={styles.progressStatus}>85% Healthy</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '85%' }]} />
          </View>
          <Text style={styles.progressSubtext}>Last analysis: 2 days ago</Text>
        </View>
      </View>

      {/* Skin Type Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Your Skin Type</Text>
        <Text style={styles.sectionSubtitle}>Choose the option that best describes your skin</Text>
        
        <View style={styles.skinTypesGrid}>
          {skinTypes.map((skinType) => (
            <TouchableOpacity
              key={skinType.id}
              style={[
                styles.skinTypeCard,
                selectedSkinType === skinType.id && styles.skinTypeCardSelected
              ]}
              onPress={() => handleSkinTypeSelect(skinType.id)}
            >
              <View style={styles.skinTypeIcon}>
                <Text style={styles.skinTypeEmoji}>{skinType.icon}</Text>
              </View>
              <Text style={styles.skinTypeName}>{skinType.name}</Text>
              <Text style={styles.skinTypeDescription}>{skinType.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Selected Skin Type Details */}
      {selectedSkin && (
        <View style={styles.detailsSection}>
          <Text style={styles.detailsTitle}>{selectedSkin.name} Characteristics</Text>
          <View style={styles.characteristicsList}>
            {selectedSkin.characteristics.map((characteristic, index) => (
              <View key={index} style={styles.characteristicItem}>
                <Text style={styles.characteristicIcon}>✓</Text>
                <Text style={styles.characteristicText}>{characteristic}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Recommended Products */}
      {selectedSkin && (
        <View style={styles.recommendationsSection}>
          <Text style={styles.recommendationsTitle}>Recommended Products</Text>
          <Text style={styles.recommendationsSubtitle}>Based on your skin type</Text>
          
          <View style={styles.productsList}>
            {selectedSkin.recommendedProducts.map((product, index) => (
              <View key={index} style={styles.productItem}>
                <View style={styles.productIcon}>
                  <Text style={styles.productEmoji}>🧴</Text>
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product}</Text>
                  <Text style={styles.productCategory}>Professional Grade</Text>
                </View>
                <TouchableOpacity 
                  style={styles.productButton}
                  onPress={() => navigation.navigate('Products' as never)}
                >
                  <Text style={styles.productButtonText}>View</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        <TouchableOpacity 
          style={[styles.primaryButton, !selectedSkinType && styles.primaryButtonDisabled]}
          onPress={handleCompleteAnalysis}
          disabled={!selectedSkinType}
        >
          <Text style={styles.primaryButtonText}>
            {analysisComplete ? 'Analysis Complete' : 'Complete Analysis'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Products' as never)}
        >
          <Text style={styles.secondaryButtonText}>Browse All Products</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 22,
  },
  progressSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  progressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  progressStatus: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4ade80',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ade80',
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: 12,
    color: '#666666',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
  },
  skinTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  skinTypeCard: {
    width: (width - 56) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  skinTypeCardSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#f0f9ff',
  },
  skinTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  skinTypeEmoji: {
    fontSize: 24,
  },
  skinTypeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
    textAlign: 'center',
  },
  skinTypeDescription: {
    fontSize: 11,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 14,
  },
  detailsSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  characteristicsList: {
    gap: 8,
  },
  characteristicItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  characteristicIcon: {
    fontSize: 14,
    color: '#4ade80',
    marginRight: 8,
    width: 16,
  },
  characteristicText: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  recommendationsSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  recommendationsSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  productsList: {
    gap: 12,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
  },
  productIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e8f5e8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  productEmoji: {
    fontSize: 16,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  productCategory: {
    fontSize: 12,
    color: '#666666',
  },
  productButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  productButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  bottomSpacing: {
    height: 30,
  },
});
