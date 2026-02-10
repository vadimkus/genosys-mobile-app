/**
 * Training Screen - Native (replaces WebView)
 * Displays training documents, product documentation, and training videos.
 * Authenticated — only visible to logged-in users.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLocalization } from '../contexts/LocalizationContext';
import { useAuth } from '../contexts/AuthContext';
import { AUTH_CONFIG } from '../config/auth';

export default function TrainingScreen() {
  const router = useRouter();
  const { t, locale, dir } = useLocalization();
  const { user } = useAuth();
  const isRTL = dir === 'rtl';

  const l = (en, ar, ru) => locale === 'ar' ? ar : locale === 'ru' ? ru : en;

  const trainingDocuments = [
    { title: 'Product Catalogue', icon: 'book', url: 'https://e1.pcloud.link/publink/show?code=XZ3GENOSYS_CATALOGUE' },
    { title: 'Home Care Guide', icon: 'home', url: 'https://e1.pcloud.link/publink/show?code=XZ3GENOSYS_HOMECARE' },
    { title: 'Professional Manual', icon: 'medical', url: 'https://e1.pcloud.link/publink/show?code=XZ3GENOSYS_PROMANUAL' },
    { title: 'Facial Treatment Protocol', icon: 'sparkles', url: 'https://e1.pcloud.link/publink/show?code=XZ3GENOSYS_FACIAL' },
    { title: 'NDcell Treatment Guide', icon: 'pulse', url: 'https://e1.pcloud.link/publink/show?code=XZ3GENOSYS_NDCELL' },
    { title: 'EyeCell Treatment Guide', icon: 'eye', url: 'https://e1.pcloud.link/publink/show?code=XZ3GENOSYS_EYECELL' },
    { title: 'BodyCell Treatment Guide', icon: 'body', url: 'https://e1.pcloud.link/publink/show?code=XZ3GENOSYS_BODYCELL' },
  ];

  const trainingVideos = [
    { title: 'BodyCell Treatment', youtubeId: 'bodycell_video_id', thumbnail: '🏋️' },
    { title: 'NDcell Treatment', youtubeId: 'ndcell_video_id', thumbnail: '💆' },
    { title: 'EyeCell Treatment', youtubeId: 'eyecell_video_id', thumbnail: '👁️' },
    { title: 'HR3 Matrix Treatment', youtubeId: 'hr3_video_id', thumbnail: '✨' },
    { title: 'Facial Treatment', youtubeId: 'facial_video_id', thumbnail: '🧖' },
  ];

  const openDocument = async (url) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Error', 'Could not open the document. Please try again.');
    }
  };

  const openVideo = async (youtubeId) => {
    try {
      await Linking.openURL(`https://www.youtube.com/watch?v=${youtubeId}`);
    } catch {
      Alert.alert('Error', 'Could not open the video.');
    }
  };

  // Redirect if not logged in
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.header, isRTL && styles.headerRTL]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('navigation.training') || 'Training'}</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="lock-closed" size={48} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>{l('Login Required', 'يجب تسجيل الدخول', 'Требуется авторизация')}</Text>
          <Text style={styles.emptyDesc}>{l('Please log in to access training materials', 'يرجى تسجيل الدخول للوصول إلى مواد التدريب', 'Войдите для доступа к учебным материалам')}</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/auth/login')} activeOpacity={0.7}>
            <Text style={styles.loginBtnText}>{l('Log In', 'تسجيل الدخول', 'Войти')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {t('navigation.training') || 'Training'}
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroSection}>
          <Ionicons name="school" size={48} color="#16a34a" />
          <Text style={[styles.heroTitle, isRTL && styles.textRTL]}>
            {l('Training Materials', 'مواد التدريب', 'Учебные материалы')}
          </Text>
          <Text style={[styles.heroSubtitle, isRTL && styles.textRTL]}>
            {l('Professional resources for GENOSYS partners', 'موارد مهنية لشركاء جينوسيس', 'Профессиональные ресурсы для партнёров GENOSYS')}
          </Text>
        </View>

        {/* Training Documents */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, isRTL && styles.sectionHeaderRTL]}>
            <View style={[styles.sectionIconBg, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="document-text" size={20} color="#16a34a" />
            </View>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              {l('Training Documents', 'وثائق التدريب', 'Учебные документы')}
            </Text>
          </View>
          {trainingDocuments.map((doc, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.docCard, isRTL && styles.docCardRTL]}
              onPress={() => openDocument(doc.url)}
              activeOpacity={0.7}
            >
              <View style={styles.docIcon}>
                <Ionicons name={doc.icon} size={20} color="#16a34a" />
              </View>
              <Text style={[styles.docTitle, isRTL && styles.textRTL]}>{doc.title}</Text>
              <Ionicons name="download-outline" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Training Videos */}
        <View style={[styles.section, styles.sectionAlt]}>
          <View style={[styles.sectionHeader, isRTL && styles.sectionHeaderRTL]}>
            <View style={[styles.sectionIconBg, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="play-circle" size={20} color="#dc2626" />
            </View>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              {l('Training Videos', 'فيديوهات التدريب', 'Обучающие видео')}
            </Text>
          </View>
          <View style={styles.videoGrid}>
            {trainingVideos.map((video, index) => (
              <TouchableOpacity
                key={index}
                style={styles.videoCard}
                onPress={() => openVideo(video.youtubeId)}
                activeOpacity={0.7}
              >
                <View style={styles.videoThumb}>
                  <Text style={styles.videoEmoji}>{video.thumbnail}</Text>
                  <View style={styles.playOverlay}>
                    <Ionicons name="play" size={24} color="#ffffff" />
                  </View>
                </View>
                <Text style={[styles.videoTitle, isRTL && styles.textRTL]} numberOfLines={2}>{video.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB',
  },
  headerRTL: { flexDirection: 'row-reverse' },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '600', color: '#1F2937', textAlign: 'center', marginHorizontal: 8 },
  scrollView: { flex: 1 },

  // Hero
  heroSection: { paddingHorizontal: 20, paddingVertical: 28, alignItems: 'center', backgroundColor: '#FAFAFA' },
  heroTitle: { fontSize: 22, fontWeight: '700', color: '#000', textAlign: 'center', marginTop: 12, marginBottom: 8 },
  heroSubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center' },

  // Sections
  section: { paddingHorizontal: 20, paddingVertical: 20 },
  sectionAlt: { backgroundColor: '#FAFAFA' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  sectionHeaderRTL: { flexDirection: 'row-reverse' },
  sectionIconBg: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#000', letterSpacing: -0.3 },

  // Document Cards
  docCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#F3F4F6' },
  docCardRTL: { flexDirection: 'row-reverse' },
  docIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  docTitle: { flex: 1, fontSize: 15, fontWeight: '500', color: '#374151' },

  // Video Grid
  videoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  videoCard: { width: '47%', backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' },
  videoThumb: { height: 90, backgroundColor: '#1F2937', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  videoEmoji: { fontSize: 32 },
  playOverlay: { position: 'absolute', width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(220, 38, 38, 0.9)', alignItems: 'center', justifyContent: 'center' },
  videoTitle: { fontSize: 13, fontWeight: '600', color: '#374151', padding: 10 },

  // Empty State (not logged in)
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#374151', marginTop: 16, marginBottom: 8 },
  emptyDesc: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  loginBtn: { backgroundColor: '#dc2626', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  // RTL
  textRTL: { writingDirection: 'rtl', textAlign: 'right' },
});
