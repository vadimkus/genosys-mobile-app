/**
 * Skin Analysis Camera Screen
 * Captures a selfie photo and runs client-side skin analysis.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalization } from '../contexts/LocalizationContext';
import SkinAnalysisResults from '../components/SkinAnalysisResults';
import { analyzeSkinImage } from '../utils/skinImageAnalysis';

export default function SkinAnalysisCameraScreen() {
  const { t, dir } = useLocalization();
  const isRTL = dir === 'rtl';
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [capturing, setCapturing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: false,
        skipProcessing: false,
      });

      setAnalyzing(true);

      // Run analysis
      const result = await analyzeSkinImage(photo.uri);
      setAnalysisResult(result);
    } catch (error) {
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    } finally {
      setCapturing(false);
      setAnalyzing(false);
    }
  };

  // Permission not determined yet
  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#dc2626" />
        </View>
      </SafeAreaView>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.header, isRTL && styles.headerRTL]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('skinAnalysis.title')}</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.centerContent}>
          <Ionicons name="camera-outline" size={64} color="#D1D5DB" />
          <Text style={styles.permissionText}>{t('skinAnalysis.cameraPermission')}</Text>
          <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission} activeOpacity={0.85}>
            <Text style={styles.permissionBtnText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Show results if analysis is complete
  if (analysisResult) {
    return (
      <SkinAnalysisResults
        result={analysisResult}
        onReset={() => setAnalysisResult(null)}
        onBack={() => router.back()}
      />
    );
  }

  // Camera view
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[styles.header, styles.headerOverCamera, isRTL && styles.headerRTL]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: '#ffffff' }]}>{t('skinAnalysis.title')}</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="front"
        >
          {/* Face guide overlay */}
          <View style={styles.overlay}>
            <View style={styles.faceGuide}>
              <View style={styles.faceOval} />
            </View>
            <Text style={styles.guideText}>
              {analyzing ? t('skinAnalysis.analyzing') : 'Position your face in the oval'}
            </Text>
          </View>
        </CameraView>
      </View>

      {/* Capture button */}
      <View style={styles.captureArea}>
        {analyzing ? (
          <ActivityIndicator size="large" color="#dc2626" />
        ) : (
          <TouchableOpacity
            style={styles.captureBtn}
            onPress={handleCapture}
            disabled={capturing}
            activeOpacity={0.8}
          >
            <View style={styles.captureInner}>
              <Ionicons name="camera" size={32} color="#dc2626" />
            </View>
          </TouchableOpacity>
        )}
        <Text style={styles.captureLabel}>{t('skinAnalysis.capturePhoto')}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    gap: 16,
    padding: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    zIndex: 10,
  },
  headerOverCamera: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 10,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  headerRTL: { flexDirection: 'row-reverse' },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: '#1F2937' },

  permissionText: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginTop: 8 },
  permissionBtn: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  permissionBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  cameraContainer: { flex: 1 },
  camera: { flex: 1 },

  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceGuide: {
    width: 250,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceOval: {
    width: 220,
    height: 300,
    borderRadius: 110,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderStyle: 'dashed',
  },
  guideText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  captureArea: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#000000',
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#dc2626',
  },
  captureInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureLabel: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
});
