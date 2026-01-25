import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const RecipePreloader = ({ onComplete }: { onComplete?: () => void }) => {
  const [loading, setLoading] = useState(true);
  
  // Animation values
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
      {/* Extra Large Logo - Increased size */}
      <Animated.View style={[styles.logoContainer, { opacity: logoOpacity }]}>
        <Image
          source={require('../../assets/images/logo1.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Progress Bar */}
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
    // Increased from width * 0.9 to width * 0.95 (95% of screen width)
    width: width * 0.95, 
    height: width * 0.95, // Keep it square
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50, // Increased margin for better spacing
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 100, // Adjusted position for larger logo
    width: width * 0.8, // Made progress bar wider to match logo size
    height: 5, // Slightly thicker progress bar
    backgroundColor: '#e5e7eb',
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#F97316',
    borderRadius: 2.5,
  },
});

export default RecipePreloader;