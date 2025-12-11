import React from 'react';
import { ScrollView, View, Image, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_HEIGHT = 400;

export default function ParallaxScrollView({ 
  imageSource, 
  children, 
  headerHeight = HEADER_HEIGHT 
}) {
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: headerHeight }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
      
      <View 
        style={[
          styles.header,
          { height: headerHeight },
        ]}
      >
        <Image
          source={imageSource}
          style={styles.headerImage}
          resizeMode="cover"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: SCREEN_WIDTH,
    overflow: 'hidden',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
});
