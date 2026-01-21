import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const Preloader = () => {
  const [loading, setLoading] = useState(true);
  
  // Animation values
  const dot1Pos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const dot2Pos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const dot3Pos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const dot1Scale = useRef(new Animated.Value(1)).current;
  const dot2Scale = useRef(new Animated.Value(1)).current;
  const dot3Scale = useRef(new Animated.Value(1)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;
  
  // Text animation for "CookBook"
  const textScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start rotation animation
    Animated.loop(
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Dot animations
    const animateDot = (
      position: Animated.ValueXY,
      scale: Animated.Value,
      x: number,
      y: number,
      delay: number
    ) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(position, {
              toValue: { x, y },
              duration: 450,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 0.45,
              duration: 450,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.delay(350),
          Animated.parallel([
            Animated.timing(position, {
              toValue: { x: 0, y: 0 },
              duration: 450,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1,
              duration: 450,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.delay(750),
        ])
      );
    };

    // Start dot animations
    animateDot(dot1Pos, dot1Scale, 40, 30, 0).start();
    animateDot(dot2Pos, dot2Scale, -40, 30, 150).start();
    animateDot(dot3Pos, dot3Scale, 0, -45, 300).start();

    // Text pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(textScale, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(textScale, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Hide preloader after 2 seconds
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  // Rotation interpolation
  const rotateInterpolate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  return (
    <View style={styles.container}>
      {/* Dots container with rotation */}
      <Animated.View style={[
        styles.dotsContainer,
        { transform: [{ rotate: rotateInterpolate }] }
      ]}>
        {/* Orange dot */}
        <Animated.View style={[
          styles.dot,
          styles.dot1,
          {
            transform: [
              { translateX: dot1Pos.x },
              { translateY: dot1Pos.y },
              { scale: dot1Scale }
            ]
          }
        ]} />
        
        {/* White dot */}
        <Animated.View style={[
          styles.dot,
          styles.dot2,
          {
            transform: [
              { translateX: dot2Pos.x },
              { translateY: dot2Pos.y },
              { scale: dot2Scale }
            ]
          }
        ]} />
        
        {/* Cream dot */}
        <Animated.View style={[
          styles.dot,
          styles.dot3,
          {
            transform: [
              { translateX: dot3Pos.x },
              { translateY: dot3Pos.y },
              { scale: dot3Scale }
            ]
          }
        ]} />
      </Animated.View>

      {/* Large Black CookBook Text with pulse animation */}
      <Animated.Text style={[
        styles.cookbookText,
        { transform: [{ scale: textScale }] }
      ]}>
        CookBook
      </Animated.Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>Your Recipe Companion</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 9999,
  },
  dotsContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 70,
    height: 70,
    borderRadius: 35,
    position: 'absolute',
  },
  dot1: {
    backgroundColor: '#F97316',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  dot2: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  dot3: {
    backgroundColor: '#FBBF24',
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  cookbookText: {
    fontSize: 56,
    fontWeight: '900', // Extra bold
    color: '#000000',
    marginTop: 40,
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    marginTop: 12,
    fontWeight: '500',
  },
});

export default Preloader;