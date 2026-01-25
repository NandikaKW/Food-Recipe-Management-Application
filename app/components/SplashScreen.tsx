import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onComplete }: { onComplete?: () => void }) => {
  const [loading, setLoading] = useState(true);
  
  // Animation values - Simplified to match RecipePreloader
  const progressWidth = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate progress bar from 0 to 100%
    Animated.timing(progressWidth, {
      toValue: 1,
      duration: 2500,
      useNativeDriver: false,
    }).start();

    // Hide preloader after 2.5 seconds
    const timer = setTimeout(() => {
      Animated.timing(logoOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setLoading(false);
        if (onComplete) onComplete();
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <View style={styles.container}>
      {/* Large Logo - Clean design without animations */}
      <Animated.View style={[styles.logoContainer, { opacity: logoOpacity }]}>
        <Image
          source={require('../../assets/images/logo2.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Progress Bar - Clean design */}
      <View style={styles.progressContainer}>
        <Animated.View 
          style={[
            styles.progressBar,
            {
              width: progressWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            }
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 9999,
  },
  logoContainer: {
    // Larger logo size like RecipePreloader
    width: width * 0.95, 
    height: width * 0.95,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 100,
    width: width * 0.8,
    height: 5,
    backgroundColor: '#e5e7eb',
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10b981', 
    borderRadius: 2.5,
  },
});

export default SplashScreen;