/**
 * Advanced Features Demo Screen
 * Demonstrates analytics, notifications, offline support, and deep linking
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  TextInput,
  Share,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAdvancedFeatures } from '../../hooks/useAdvancedFeatures';
import { Ionicons } from '@expo/vector-icons';

export default function AdvancedFeaturesScreen() {
  const { theme } = useTheme();
  const [advancedState, advancedActions] = useAdvancedFeatures();
  const [notificationTitle, setNotificationTitle] =
    useState('Test Notification');
  const [notificationBody, setNotificationBody] = useState(
    'This is a test notification'
  );
  const [offlineKey, setOfflineKey] = useState('test_data');
  const [offlineValue, setOfflineValue] = useState('Sample offline data');

  useEffect(() => {
    // Track screen view
    advancedActions.trackScreen('AdvancedFeaturesScreen');
  }, [advancedActions]);

  const handleSendNotification = async () => {
    try {
      const notificationId = await advancedActions.sendNotification(
        notificationTitle,
        notificationBody,
        { source: 'advanced_features_demo' }
      );
      Alert.alert('Success', `Notification sent with ID: ${notificationId}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to send notification');
    }
  };

  const handleRequestPermissions = async () => {
    try {
      const granted = await advancedActions.requestPermissions();
      Alert.alert(
        'Permissions',
        granted
          ? 'Notification permissions granted!'
          : 'Notification permissions denied'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to request permissions');
    }
  };

  const handleStoreOffline = async () => {
    try {
      await advancedActions.storeDataOffline(
        offlineKey,
        offlineValue,
        'create'
      );
      Alert.alert('Success', 'Data stored offline successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to store data offline');
    }
  };

  const handleGetOfflineData = async () => {
    try {
      const data = await advancedActions.getOfflineData(offlineKey);
      Alert.alert(
        'Offline Data',
        data ? JSON.stringify(data) : 'No data found'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to get offline data');
    }
  };

  const handleForceSync = async () => {
    try {
      await advancedActions.forceSync();
      Alert.alert('Success', 'Data sync completed');
    } catch (error) {
      Alert.alert('Error', 'Failed to sync data');
    }
  };

  const handleGenerateLink = () => {
    const link = advancedActions.generateLink('product/123', {
      category: 'skincare',
    });
    Alert.alert('Generated Link', link);
  };

  const handleShareLink = async () => {
    try {
      const link = await advancedActions.shareLink('product/123', {
        category: 'skincare',
      });
      await Share.share({
        message: `Check out this product: ${link}`,
        url: link,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share link');
    }
  };

  const handleTrackEvent = () => {
    advancedActions.trackEvent('demo_button_clicked', {
      button: 'track_event',
      timestamp: Date.now(),
    });
    Alert.alert('Success', 'Event tracked successfully');
  };

  const handleTrackPurchase = () => {
    advancedActions.trackPurchase('order_123', 299.99, [
      {
        id: '1',
        name: 'Test Product',
        category: 'skincare',
        quantity: 1,
        price: 299.99,
      },
    ]);
    Alert.alert('Success', 'Purchase tracked successfully');
  };

  const handleScheduleNotification = async () => {
    try {
      const notificationId = await advancedActions.scheduleNotification(
        'Scheduled Notification',
        'This notification was scheduled for 5 seconds from now',
        5
      );
      Alert.alert(
        'Success',
        `Notification scheduled with ID: ${notificationId}`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to schedule notification');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      padding: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 12,
    },
    statusCard: {
      backgroundColor: theme.colors.surface,
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
    },
    statusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    statusLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    statusValue: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
    },
    button: {
      backgroundColor: theme.colors.primary,
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '500',
      marginLeft: 8,
    },
    input: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
      color: theme.colors.text,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
      marginBottom: 4,
    },
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    switchLabel: {
      fontSize: 14,
      color: theme.colors.text,
    },
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}
    >
      {/* Status Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 System Status</Text>
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Analytics</Text>
            <Text
              style={[
                styles.statusValue,
                {
                  color: advancedState.isAnalyticsEnabled
                    ? theme.colors.success
                    : theme.colors.error,
                },
              ]}
            >
              {advancedState.isAnalyticsEnabled ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Notifications</Text>
            <Text
              style={[
                styles.statusValue,
                {
                  color: advancedState.isNotificationsEnabled
                    ? theme.colors.success
                    : theme.colors.error,
                },
              ]}
            >
              {advancedState.isNotificationsEnabled ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Network</Text>
            <Text
              style={[
                styles.statusValue,
                {
                  color: advancedState.syncStatus.isOnline
                    ? theme.colors.success
                    : theme.colors.error,
                },
              ]}
            >
              {advancedState.syncStatus.isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>App State</Text>
            <Text style={styles.statusValue}>{advancedState.appState}</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Session Duration</Text>
            <Text style={styles.statusValue}>
              {Math.floor(advancedState.sessionDuration / 1000)}s
            </Text>
          </View>
        </View>
      </View>

      {/* Analytics Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📈 Analytics</Text>
        <TouchableOpacity style={styles.button} onPress={handleTrackEvent}>
          <Ionicons name='analytics' size={20} color='#ffffff' />
          <Text style={styles.buttonText}>Track Custom Event</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleTrackPurchase}>
          <Ionicons name='card' size={20} color='#ffffff' />
          <Text style={styles.buttonText}>Track Purchase</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔔 Notifications</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={handleRequestPermissions}
        >
          <Ionicons name='notifications' size={20} color='#ffffff' />
          <Text style={styles.buttonText}>Request Permissions</Text>
        </TouchableOpacity>

        <Text style={styles.inputLabel}>Notification Title</Text>
        <TextInput
          style={styles.input}
          value={notificationTitle}
          onChangeText={setNotificationTitle}
          placeholder='Enter notification title'
        />

        <Text style={styles.inputLabel}>Notification Body</Text>
        <TextInput
          style={styles.input}
          value={notificationBody}
          onChangeText={setNotificationBody}
          placeholder='Enter notification body'
          multiline
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSendNotification}
        >
          <Ionicons name='send' size={20} color='#ffffff' />
          <Text style={styles.buttonText}>Send Notification</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleScheduleNotification}
        >
          <Ionicons name='time' size={20} color='#ffffff' />
          <Text style={styles.buttonText}>Schedule Notification (5s)</Text>
        </TouchableOpacity>
      </View>

      {/* Offline Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 Offline Support</Text>
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Pending Sync</Text>
            <Text style={styles.statusValue}>
              {advancedState.syncStatus.pendingCount}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Failed Sync</Text>
            <Text style={styles.statusValue}>
              {advancedState.syncStatus.failedCount}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Synced</Text>
            <Text style={styles.statusValue}>
              {advancedState.syncStatus.syncedCount}
            </Text>
          </View>
        </View>

        <Text style={styles.inputLabel}>Offline Key</Text>
        <TextInput
          style={styles.input}
          value={offlineKey}
          onChangeText={setOfflineKey}
          placeholder='Enter data key'
        />

        <Text style={styles.inputLabel}>Offline Value</Text>
        <TextInput
          style={styles.input}
          value={offlineValue}
          onChangeText={setOfflineValue}
          placeholder='Enter data value'
        />

        <TouchableOpacity style={styles.button} onPress={handleStoreOffline}>
          <Ionicons name='save' size={20} color='#ffffff' />
          <Text style={styles.buttonText}>Store Offline</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleGetOfflineData}>
          <Ionicons name='download' size={20} color='#ffffff' />
          <Text style={styles.buttonText}>Get Offline Data</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleForceSync}>
          <Ionicons name='sync' size={20} color='#ffffff' />
          <Text style={styles.buttonText}>Force Sync</Text>
        </TouchableOpacity>
      </View>

      {/* Deep Linking Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔗 Deep Linking</Text>
        <TouchableOpacity style={styles.button} onPress={handleGenerateLink}>
          <Ionicons name='link' size={20} color='#ffffff' />
          <Text style={styles.buttonText}>Generate Link</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleShareLink}>
          <Ionicons name='share' size={20} color='#ffffff' />
          <Text style={styles.buttonText}>Share Link</Text>
        </TouchableOpacity>
      </View>

      {/* App State Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 App State</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={advancedActions.refreshAppState}
        >
          <Ionicons name='refresh' size={20} color='#ffffff' />
          <Text style={styles.buttonText}>Refresh App State</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={advancedActions.endSession}
        >
          <Ionicons name='log-out' size={20} color='#ffffff' />
          <Text style={styles.buttonText}>End Session</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
