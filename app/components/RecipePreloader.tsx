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

const RecipePreloader = ({ onComplete }: { onComplete?: () => void }) => {
  const [loading, setLoading] = useState(true);
  
  // Animation values
  const circle1Pos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const circle2Pos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const circle3Pos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const circle4Pos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  
  const circle1Scale = useRef(new Animated.Value(1)).current;
  const circle2Scale = useRef(new Animated.Value(1)).current;
  const circle3Scale = useRef(new Animated.Value(1)).current;
  const circle4Scale = useRef(new Animated.Value(1)).current;
  
  const circle1Opacity = useRef(new Animated.Value(1)).current;
  const circle2Opacity = useRef(new Animated.Value(1)).current;
  const circle3Opacity = useRef(new Animated.Value(1)).current;
  const circle4Opacity = useRef(new Animated.Value(1)).current;
  
  const textScale = useRef(new Animated.Value(0.8)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  
  // Rotation animation for dots container
  const rotateValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startAnimations();
  }, []);

  const startAnimations = () => {
    // Rotation animation for dots container
    Animated.loop(
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Circles floating animation
    const createCircleAnimation = (
      pos: Animated.ValueXY,
      scale: Animated.Value,
      opacity: Animated.Value,
      x: number,
      y: number,
      delay: number
    ) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(pos, {
              toValue: { x, y },
              duration: 1200,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1.2,
              duration: 600,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.8,
              duration: 600,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(pos, {
              toValue: { x: 0, y: 0 },
              duration: 1200,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1,
              duration: 600,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 600,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ])
      );
    };

    // Start all circle animations
    createCircleAnimation(circle1Pos, circle1Scale, circle1Opacity, 50, -40, 0).start();
    createCircleAnimation(circle2Pos, circle2Scale, circle2Opacity, -50, -40, 200).start();
    createCircleAnimation(circle3Pos, circle3Scale, circle3Opacity, 50, 40, 400).start();
    createCircleAnimation(circle4Pos, circle4Scale, circle4Opacity, -50, 40, 600).start();

    // Text animation
    Animated.sequence([
      Animated.delay(500),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(textScale, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Text pulse animation (continuous)
    Animated.loop(
      Animated.sequence([
        Animated.delay(1500),
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

    // Hide preloader after 3 seconds
    const timer = setTimeout(() => {
      setLoading(false);
      if (onComplete) {
        onComplete();
      }
    }, 3000);

    return () => clearTimeout(timer);
  };

  if (!loading) return null;

  // Rotation interpolation
  const rotateInterpolate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Rotating dots container */}
      <Animated.View 
        style={[
          styles.dotsContainer,
          { transform: [{ rotate: rotateInterpolate }] }
        ]}
      >
        {/* Background circles with food colors */}
        <Animated.View 
          style={[
            styles.circle,
            styles.circle1,
            {
              transform: [
                { translateX: circle1Pos.x },
                { translateY: circle1Pos.y },
                { scale: circle1Scale }
              ],
              opacity: circle1Opacity
            }
          ]} 
        />
        
        <Animated.View 
          style={[
            styles.circle,
            styles.circle2,
            {
              transform: [
                { translateX: circle2Pos.x },
                { translateY: circle2Pos.y },
                { scale: circle2Scale }
              ],
              opacity: circle2Opacity
            }
          ]} 
        />
        
        <Animated.View 
          style={[
            styles.circle,
            styles.circle3,
            {
              transform: [
                { translateX: circle3Pos.x },
                { translateY: circle3Pos.y },
                { scale: circle3Scale }
              ],
              opacity: circle3Opacity
            }
          ]} 
        />
        
        <Animated.View 
          style={[
            styles.circle,
            styles.circle4,
            {
              transform: [
                { translateX: circle4Pos.x },
                { translateY: circle4Pos.y },
                { scale: circle4Scale }
              ],
              opacity: circle4Opacity
            }
          ]} 
        />
      </Animated.View>

      {/* Text content */}
      <View style={styles.textContainer}>
        <Animated.Text 
          style={[
            styles.primaryText,
            {
              opacity: textOpacity,
              transform: [{ scale: textScale }]
            }
          ]}
        >
          CookBook
        </Animated.Text>
        
        <Animated.Text 
          style={[
            styles.secondaryText,
            {
              opacity: textOpacity
            }
          ]}
        >
          Your Recipe Companion
        </Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff9f0', // Soft warm background
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 9999,
  },
  dotsContainer: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
  },
  circle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  circle1: {
    backgroundColor: '#F97316', // Orange for carrots/orange vegetables
  },
  circle2: {
    backgroundColor: '#10B981', // Green for herbs/vegetables
  },
  circle3: {
    backgroundColor: '#F59E0B', // Yellow for spices/lemons
  },
  circle4: {
    backgroundColor: '#8B5CF6', // Purple for berries/eggplant
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  primaryText: {
    fontSize: 56,
    fontWeight: '900', // Extra bold like second example
    color: '#000000', // Black text like second example
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  secondaryText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '500',
    fontStyle: 'normal', // Removed italic
    letterSpacing: 0.5,
  },
});

export default RecipePreloader;