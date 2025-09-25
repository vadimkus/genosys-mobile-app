import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface TrainingDocument {
  id: string;
  title: string;
  size: string;
  url: string;
  category: 'training' | 'product';
}

interface TrainingLesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  category: string;
  certification: boolean;
  learnItems: string[];
}

export default function TrainingScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'documents' | 'lessons'>('documents');

  const trainingDocuments: TrainingDocument[] = [
    // Training Documents
    { id: '1', title: 'Product Catalogue 2026', size: '235.5 MB', url: '/documents/ppt/Product_Catalogue_2026.pdf', category: 'training' },
    { id: '2', title: 'Home Care Guide 2026', size: '9.8 MB', url: '/documents/ppt/Home_Care_Guide_2026.pdf', category: 'training' },
    { id: '3', title: 'Professional Manual 2026', size: '10.4 MB', url: '/documents/ppt/Professional_Manual_2026.pdf', category: 'training' },
    { id: '4', title: 'Facial Treatment Homecare 2026', size: '8.2 MB', url: '/documents/ppt/GENOSYS_FACIAL_TREATMENT_Homecare_2025.pdf', category: 'training' },
    { id: '5', title: 'Facial Treatment Professional 2026', size: '8.2 MB', url: '/documents/ppt/GENOSYS_FACIAL_TREATMENT_Professional_2025.pdf', category: 'training' },
    
    // Product Documentation
    { id: '6', title: 'MULTI VITA RADIANCE CREAM', size: '2.1 MB', url: '/documents/ppt/MULTI_VITA_RADIANCE_CREAM.pdf', category: 'product' },
    { id: '7', title: 'EyeCell EYE ZONE CARE SYSTEM', size: '1.8 MB', url: '/documents/ppt/EyeCell_EYE_ZONE_CARE_SYSTEM.pdf', category: 'product' },
    { id: '8', title: 'EPI TURNOVER BOOSTING PEELING GEL', size: '3.8 MB', url: '/documents/ppt/EPI_TURNOVER_BOOSTING_PEELING_GEL.pdf', category: 'product' },
    { id: '9', title: 'MULTI VITA RADIANCE SERUM', size: '1.5 MB', url: '/documents/ppt/MULTI_VITA_RADIANCE_SERUM.pdf', category: 'product' },
    { id: '10', title: 'SKIN DEFENDER LIP & EYE MAKEUP REMOVER', size: '0.7 MB', url: '/documents/ppt/SKIN_DEFENDER_LIP_EYE_MAKEUP_REMOVER.pdf', category: 'product' },
    { id: '11', title: 'MICROBIOME ENERGY INFUSING MIST', size: '0.8 MB', url: '/documents/ppt/MICROBIOME_ENERGY_INFUSING_MIST.pdf', category: 'product' },
    { id: '12', title: 'SKIN RESCUE OVERNIGHT CREAM MASK', size: '1.3 MB', url: '/documents/ppt/SKIN_RESCUE_OVERNIGHT_CREAM_MASK.pdf', category: 'product' },
    { id: '13', title: 'INTENSIVE PROBLEM CONTROL TONER', size: '1.0 MB', url: '/documents/ppt/INTENSIVE_PROBLEM_CONTROL_TONER.pdf', category: 'product' },
    { id: '14', title: 'ULTRA SHIELD SUN CREAM', size: '0.6 MB', url: '/documents/ppt/ULTRA_SHIELD_SUN_CREAM.pdf', category: 'product' },
    { id: '15', title: 'HR³ MATRIX SCALP SHAMPOO α', size: '2.3 MB', url: '/documents/ppt/HR3_MATRIX_SCALP_SHAMPOO_ALPHA.pdf', category: 'product' },
    { id: '16', title: 'MOISTURE REPLENISHING HYALURON SERUM', size: '1.9 MB', url: '/documents/ppt/MOISTURE_REPLENISHING_HYALURON_SERUM.pdf', category: 'product' },
    { id: '17', title: 'MOISTURE REPLENISHING HYALURON CREAM', size: '2.0 MB', url: '/documents/ppt/MOISTURE_REPLENISHING_HYALURON_CREAM.pdf', category: 'product' },
    { id: '18', title: 'SKIN CARING BLEMISH BALM CUSHION', size: '1.2 MB', url: '/documents/ppt/SKIN_CARING_BLEMISH_BALM_CUSHION.pdf', category: 'product' },
    { id: '19', title: 'EyeCell EYE PEPTIDE GEL PATCH', size: '1.4 MB', url: '/documents/ppt/EyeCell_EYE_PEPTIDE_GEL_PATCH.pdf', category: 'product' },
    { id: '20', title: 'BIO-FERMENT AGE DEFYING POWDER MASK', size: '2.1 MB', url: '/documents/ppt/BIO_FERMENT_AGE_DEFYING_POWDER_MASK.pdf', category: 'product' },
    { id: '21', title: 'HAIR GENTRON', size: '1.8 MB', url: '/documents/ppt/HAIR_GENTRON.pdf', category: 'product' },
    { id: '22', title: 'HR³ MATRIX HAIR SOLUTION α', size: '2.3 MB', url: '/documents/ppt/HR3_MATRIX_HAIR_SOLUTION_ALPHA.pdf', category: 'product' },
    { id: '23', title: 'HR³ MATRIX HAIR TONIC α', size: '1.9 MB', url: '/documents/ppt/HR3_MATRIX_HAIR_TONIC_ALPHA.pdf', category: 'product' },
    { id: '24', title: 'HR³ MATRIX SCALP PEELING α', size: '2.1 MB', url: '/documents/ppt/HR3_MATRIX_SCALP_PEELING_ALPHA.pdf', category: 'product' },
    { id: '25', title: 'GENO-LED IR II', size: '4.6 MB', url: '/documents/ppt/GENO_LED_IR_II.pdf', category: 'product' },
    { id: '26', title: 'GENOSYS SKIN REBOOT PDRN MASK PACK', size: '1.2 MB', url: '/documents/ppt/GENOSYS_SKIN_REBOOT_PDRN_MASK_PACK.pdf', category: 'product' },
    { id: '27', title: 'EZ CO₂ MASK KIT', size: '0.5 MB', url: '/documents/ppt/EZ_CO2_MASK_KIT.pdf', category: 'product' },
  ];

  const trainingLessons: TrainingLesson[] = [
    {
      id: '1',
      title: 'Genosys Bodycell Stretch Mark Treatment',
      description: 'Learn the professional techniques for treating stretch marks using Genosys Bodycell technology.',
      duration: '15-20 minutes',
      level: 'Professional',
      category: 'Body Treatments',
      certification: true,
      learnItems: [
        'Proper product application techniques',
        'Safety protocols and precautions',
        'Treatment duration and frequency',
        'Expected results and timeline',
        'Client consultation best practices'
      ]
    },
    {
      id: '2',
      title: 'Genosys NDcell Neck & Decollete Treatment',
      description: 'Master the specialized techniques for treating the delicate neck and décolletage area.',
      duration: '18-22 minutes',
      level: 'Advanced Professional',
      category: 'Specialized Treatments',
      certification: true,
      learnItems: [
        'Specialized neck and décolletage techniques',
        'Proper handling of sensitive skin areas',
        'Treatment protocols and timing',
        'Client positioning and comfort',
        'Post-treatment care instructions'
      ]
    },
    {
      id: '3',
      title: 'Genosys EyeCell Treatment',
      description: 'Learn the precise techniques for treating the delicate eye area using Genosys EyeCell technology.',
      duration: '16-20 minutes',
      level: 'Advanced Professional',
      category: 'Specialized Eye Treatments',
      certification: true,
      learnItems: [
        'Precise eye area treatment techniques',
        'Safety protocols for sensitive eye region',
        'Client positioning and eye protection',
        'Treatment intensity and duration',
        'Post-treatment care and recommendations'
      ]
    },
    {
      id: '4',
      title: 'Genosys HR3 Matrix Treatment',
      description: 'Master the advanced HR3 Matrix treatment techniques using Genosys technology.',
      duration: '20-25 minutes',
      level: 'Advanced Professional',
      category: 'Matrix Treatments',
      certification: true,
      learnItems: [
        'HR3 Matrix application techniques',
        'Treatment protocols and timing',
        'Skin preparation and assessment',
        'Client consultation and expectations',
        'Post-treatment care and follow-up'
      ]
    },
    {
      id: '5',
      title: 'Facial Treatment',
      description: 'Learn comprehensive facial treatment techniques using Genosys products and protocols.',
      duration: '25-30 minutes',
      level: 'Professional',
      category: 'Facial Treatments',
      certification: true,
      learnItems: [
        'Complete facial treatment protocols',
        'Product application sequences',
        'Skin analysis and assessment',
        'Client consultation techniques',
        'Treatment customization methods'
      ]
    },
    {
      id: '6',
      title: 'How to use Genosys Snow 02 Cleanser',
      description: 'Master the proper techniques for using Genosys Snow 02 Cleanser effectively.',
      duration: '12-15 minutes',
      level: 'Professional',
      category: 'Product Usage',
      certification: true,
      learnItems: [
        'Proper Snow 02 Cleanser application',
        'Correct timing and duration',
        'Skin type considerations',
        'Product benefits and results',
        'Integration with other treatments'
      ]
    },
    {
      id: '7',
      title: 'GENOSYS HR3 MATRIX',
      description: 'Advanced training on GENOSYS HR3 MATRIX technology and application techniques.',
      duration: '22-28 minutes',
      level: 'Advanced Professional',
      category: 'Matrix Treatments',
      certification: true,
      learnItems: [
        'Advanced HR3 MATRIX techniques',
        'Matrix treatment protocols',
        'Skin assessment and preparation',
        'Treatment customization methods',
        'Results optimization strategies'
      ]
    },
    {
      id: '8',
      title: 'GENOSYS HR3 MATRIX HAIR SOLUTION ALPHA',
      description: 'Specialized training on GENOSYS HR3 MATRIX HAIR SOLUTION ALPHA for advanced hair treatment protocols.',
      duration: '24-30 minutes',
      level: 'Advanced Professional',
      category: 'Hair Treatments',
      certification: true,
      learnItems: [
        'Hair matrix treatment protocols',
        'Scalp preparation techniques',
        'ALPHA solution application methods',
        'Hair restoration procedures',
        'Treatment customization for hair types'
      ]
    },
    {
      id: '9',
      title: 'Eye Cell Treatment - Eye zone treatment with Eye Roller 0.25mm',
      description: 'Specialized training on Eye Cell Treatment using the Eye Roller 0.25mm for precise eye zone treatments.',
      duration: '14-18 minutes',
      level: 'Professional',
      category: 'Eye Treatments',
      certification: true,
      learnItems: [
        'Eye Roller 0.25mm application techniques',
        'Eye zone treatment protocols',
        'Safety measures for delicate eye area',
        'Proper roller pressure and movement',
        'Post-treatment care for eye zone'
      ]
    },
    {
      id: '10',
      title: 'Genosys HAIRGEN BOOSTER Treatment',
      description: 'Master the advanced hair treatment techniques using Genosys HAIRGEN BOOSTER technology.',
      duration: '20-25 minutes',
      level: 'Advanced Professional',
      category: 'Hair Treatments',
      certification: true,
      learnItems: [
        'Advanced hair treatment protocols',
        'Scalp preparation and assessment techniques',
        'HAIRGEN BOOSTER application methods',
        'Hair growth stimulation procedures',
        'Treatment customization for different hair types'
      ]
    },
    {
      id: '11',
      title: 'HR3 MATRIX Anti Hair Loss Treatment',
      description: 'Learn the specialized techniques for treating hair loss using HR3 MATRIX technology.',
      duration: '18-22 minutes',
      level: 'Advanced Professional',
      category: 'Hair Loss Treatments',
      certification: true,
      learnItems: [
        'Anti-hair loss treatment protocols',
        'HR3 MATRIX application techniques',
        'Scalp assessment and preparation methods',
        'Hair loss prevention strategies',
        'Treatment customization for different hair loss types'
      ]
    }
  ];

  const handlePdfOpen = async (url: string, title: string) => {
    try {
      const fullUrl = `https://genosys.ae${url}`;
      const supported = await Linking.canOpenURL(fullUrl);
      if (supported) {
        await Linking.openURL(fullUrl);
      } else {
        Alert.alert('Error', 'Cannot open PDF. Please try again later.');
      }
    } catch (error) {
      Alert.alert('Error', 'Cannot open PDF. Please try again later.');
    }
  };

  const renderDocumentCard = (doc: TrainingDocument) => (
    <TouchableOpacity
      key={doc.id}
      style={styles.documentCard}
      onPress={() => handlePdfOpen(doc.url, doc.title)}
    >
      <View style={styles.documentHeader}>
        <View style={styles.documentIcon}>
          <Text style={styles.documentEmoji}>📄</Text>
        </View>
        <View style={styles.documentInfo}>
          <Text style={styles.documentTitle}>{doc.title}</Text>
          <Text style={styles.documentSize}>{doc.size}</Text>
        </View>
        <View style={styles.documentAction}>
          <Text style={styles.documentArrow}>›</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderLessonCard = (lesson: TrainingLesson) => (
    <TouchableOpacity key={lesson.id} style={styles.lessonCard}>
      <View style={styles.lessonHeader}>
        <View style={styles.lessonIcon}>
          <Text style={styles.lessonEmoji}>🎓</Text>
        </View>
        <View style={styles.lessonInfo}>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <Text style={styles.lessonDescription}>{lesson.description}</Text>
        </View>
      </View>
      
      <View style={styles.lessonDetails}>
        <View style={styles.lessonMeta}>
          <View style={styles.lessonMetaItem}>
            <Text style={styles.lessonMetaLabel}>Duration</Text>
            <Text style={styles.lessonMetaValue}>{lesson.duration}</Text>
          </View>
          <View style={styles.lessonMetaItem}>
            <Text style={styles.lessonMetaLabel}>Level</Text>
            <Text style={styles.lessonMetaValue}>{lesson.level}</Text>
          </View>
          <View style={styles.lessonMetaItem}>
            <Text style={styles.lessonMetaLabel}>Category</Text>
            <Text style={styles.lessonMetaValue}>{lesson.category}</Text>
          </View>
        </View>
        
        <View style={styles.lessonLearn}>
          <Text style={styles.lessonLearnTitle}>What You'll Learn:</Text>
          {lesson.learnItems.map((item, index) => (
            <Text key={index} style={styles.lessonLearnItem}>• {item}</Text>
          ))}
        </View>
        
        {lesson.certification && (
          <View style={styles.lessonCertification}>
            <Text style={styles.lessonCertText}>✓ Certification Available</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const trainingDocs = trainingDocuments.filter(doc => doc.category === 'training');
  const productDocs = trainingDocuments.filter(doc => doc.category === 'product');

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Professional Training</Text>
          <Text style={styles.subtitle}>Comprehensive training materials and product documentation</Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'documents' && styles.tabActive]}
          onPress={() => setActiveTab('documents')}
        >
          <Text style={[styles.tabText, activeTab === 'documents' && styles.tabTextActive]}>
            Documents
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'lessons' && styles.tabActive]}
          onPress={() => setActiveTab('lessons')}
        >
          <Text style={[styles.tabText, activeTab === 'lessons' && styles.tabTextActive]}>
            Lessons
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'documents' && (
        <View style={styles.content}>
          {/* Training Documents */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Training Documents</Text>
            {trainingDocs.map(renderDocumentCard)}
          </View>

          {/* Product Documentation */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Documentation</Text>
            {productDocs.map(renderDocumentCard)}
          </View>
        </View>
      )}

      {activeTab === 'lessons' && (
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Training Lessons</Text>
            {trainingLessons.map(renderLessonCard)}
          </View>
        </View>
      )}

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#1a1a1a',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  documentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8f5e8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  documentEmoji: {
    fontSize: 18,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  documentSize: {
    fontSize: 14,
    color: '#666666',
  },
  documentAction: {
    marginLeft: 12,
  },
  documentArrow: {
    fontSize: 18,
    color: '#999999',
    fontWeight: '300',
  },
  lessonCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  lessonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e8f5e8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  lessonEmoji: {
    fontSize: 20,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    lineHeight: 24,
  },
  lessonDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  lessonDetails: {
    marginTop: 16,
  },
  lessonMeta: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  lessonMetaItem: {
    flex: 1,
  },
  lessonMetaLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 4,
    fontWeight: '500',
  },
  lessonMetaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  lessonLearn: {
    marginBottom: 16,
  },
  lessonLearnTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  lessonLearnItem: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
    marginBottom: 4,
  },
  lessonCertification: {
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  lessonCertText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  bottomSpacing: {
    height: 30,
  },
});