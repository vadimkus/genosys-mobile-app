import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';

export default function TrainingScreen() {
  const trainingVideos = [
    {
      id: '1',
      title: 'Professional Manual 2026',
      description: 'Complete professional training manual for Genosys products',
      url: 'https://genosys.ae/documents/ppt/Professional%20Manual%202026.pdf',
      type: 'PDF'
    },
    {
      id: '2',
      title: 'Facial Treatment Homecare 2026',
      description: 'Homecare treatment protocols and procedures',
      url: 'https://genosys.ae/documents/ppt/GENOSYS%20FACIAL%20TREATMENT_Homecare_2025.pdf',
      type: 'PDF'
    },
    {
      id: '3',
      title: 'Facial Treatment Professional 2026',
      description: 'Professional treatment protocols for clinics',
      url: 'https://genosys.ae/documents/ppt/GENOSYS%20FACIAL%20TREATMENT_Professional_2025.pdf',
      type: 'PDF'
    },
    {
      id: '4',
      title: 'Genosys HAIRGEN BOOSTER',
      description: 'Professional hair treatment training video',
      url: 'https://www.youtube.com/watch?v=dsS-d8HahQA',
      type: 'Video'
    },
    {
      id: '5',
      title: 'HR3 MATRIX Anti Hair Loss Treatment',
      description: 'Anti-hair loss treatment protocols',
      url: 'https://www.youtube.com/watch?v=XwOIRrizmF4',
      type: 'Video'
    }
  ];

  const handleOpenTraining = async (url: string, title: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this training material');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open training material');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Training Materials</Text>
        <Text style={styles.headerSubtitle}>Professional training resources for Genosys products</Text>
      </View>

      <View style={styles.content}>
        {trainingVideos.map((training) => (
          <TouchableOpacity
            key={training.id}
            style={styles.trainingCard}
            onPress={() => handleOpenTraining(training.url, training.title)}
          >
            <View style={styles.trainingHeader}>
              <Text style={styles.trainingTitle}>{training.title}</Text>
              <View style={[
                styles.typeBadge,
                training.type === 'PDF' ? styles.pdfBadge : styles.videoBadge
              ]}>
                <Text style={styles.typeText}>{training.type}</Text>
              </View>
            </View>
            <Text style={styles.trainingDescription}>{training.description}</Text>
            <View style={styles.trainingFooter}>
              <Text style={styles.openText}>
                {training.type === 'PDF' ? '📄 Open PDF' : '▶️ Watch Video'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.contactInfo}>
        <Text style={styles.contactTitle}>Need Help?</Text>
        <Text style={styles.contactText}>Contact our training team for assistance</Text>
        <TouchableOpacity 
          style={styles.contactButton}
          onPress={() => handleOpenTraining('https://wa.me/971585487665', 'WhatsApp')}
        >
          <Text style={styles.contactButtonText}>📱 WhatsApp Support</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#ef4444',
    padding: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#f0f0f0',
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  trainingCard: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trainingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  trainingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pdfBadge: {
    backgroundColor: '#ef4444',
  },
  videoBadge: {
    backgroundColor: '#10b981',
  },
  typeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  trainingDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  trainingFooter: {
    alignItems: 'flex-end',
  },
  openText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500',
  },
  contactInfo: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 10,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  contactButton: {
    backgroundColor: '#25d366',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  contactButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
