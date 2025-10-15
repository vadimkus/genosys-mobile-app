import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Modal } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface LoadingSpinnerProps {
  visible: boolean;
  message?: string;
  size?: 'small' | 'large';
  overlay?: boolean;
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  visible,
  message = 'Loading...',
  size = 'large',
  overlay = false,
  color,
}) => {
  const { theme } = useTheme();
  const spinnerColor = color || theme.colors.primary;

  if (!visible) return null;

  const content = (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View
        style={[
          styles.spinnerContainer,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <ActivityIndicator size={size} color={spinnerColor} />
        {message && (
          <Text style={[styles.message, { color: theme.colors.text }]}>
            {message}
          </Text>
        )}
      </View>
    </View>
  );

  if (overlay) {
    return (
      <Modal
        transparent
        visible={visible}
        animationType='fade'
        statusBarTranslucent
      >
        <View style={styles.overlay}>{content}</View>
      </Modal>
    );
  }

  return content;
};

// Inline Loading Spinner
export const InlineLoadingSpinner: React.FC<{
  size?: 'small' | 'large';
  color?: string;
  message?: string;
}> = ({ size = 'small', color, message }) => {
  const { theme } = useTheme();
  const spinnerColor = color || theme.colors.primary;

  return (
    <View style={styles.inlineContainer}>
      <ActivityIndicator size={size} color={spinnerColor} />
      {message && (
        <Text style={[styles.inlineMessage, { color: theme.colors.text }]}>
          {message}
        </Text>
      )}
    </View>
  );
};

// Button Loading State
export const ButtonLoadingSpinner: React.FC<{
  loading: boolean;
  children: React.ReactNode;
  size?: 'small' | 'large';
}> = ({ loading, children, size = 'small' }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.buttonContainer}>
      {loading && (
        <View style={styles.buttonSpinner}>
          <ActivityIndicator size={size} color='#fff' />
        </View>
      )}
      {children}
    </View>
  );
};

// Page Loading State
export const PageLoadingState: React.FC<{
  message?: string;
  showProgress?: boolean;
  progress?: number;
}> = ({ message = 'Loading...', showProgress = false, progress = 0 }) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.pageContainer,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View
        style={[
          styles.pageContent,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <ActivityIndicator size='large' color={theme.colors.primary} />
        <Text style={[styles.pageMessage, { color: theme.colors.text }]}>
          {message}
        </Text>
        {showProgress && (
          <View
            style={[
              styles.progressContainer,
              { backgroundColor: theme.colors.border },
            ]}
          >
            <View
              style={[
                styles.progressBar,
                {
                  backgroundColor: theme.colors.primary,
                  width: `${Math.min(100, Math.max(0, progress))}%`,
                },
              ]}
            />
          </View>
        )}
      </View>
    </View>
  );
};

// List Loading State
export const ListLoadingState: React.FC<{
  itemCount?: number;
  message?: string;
}> = ({ itemCount = 3, message = 'Loading items...' }) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.listContainer,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Text style={[styles.listMessage, { color: theme.colors.text }]}>
        {message}
      </Text>
      {Array.from({ length: itemCount }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.listItem,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <ActivityIndicator size='small' color={theme.colors.primary} />
          <Text style={[styles.listItemText, { color: theme.colors.text }]}>
            Loading item {index + 1}...
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  spinnerContainer: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  inlineMessage: {
    marginLeft: 8,
    fontSize: 14,
  },
  buttonContainer: {
    position: 'relative',
  },
  buttonSpinner: {
    position: 'absolute',
    left: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
    zIndex: 1,
  },
  pageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  pageContent: {
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 200,
  },
  pageMessage: {
    marginTop: 20,
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '500',
  },
  progressContainer: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    marginTop: 20,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  listContainer: {
    flex: 1,
    padding: 20,
  },
  listMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  listItemText: {
    marginLeft: 12,
    fontSize: 14,
  },
});

export default LoadingSpinner;
