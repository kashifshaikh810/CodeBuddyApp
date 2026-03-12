import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

export const useFadeIn = (duration: number = 1000, delay: number = 0) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        useNativeDriver: true,
        easing: Easing.ease,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [fadeAnim, duration, delay]);

  return fadeAnim;
};

export const useSlideIn = (direction: 'left' | 'right' | 'up' | 'down' = 'up', duration: number = 800, delay: number = 0) => {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      const toValue = direction === 'left' || direction === 'right' ? 1 : 1;
      Animated.timing(slideAnim, {
        toValue,
        duration,
        useNativeDriver: true,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [slideAnim, duration, delay, direction]);

  const getTransform = () => {
    switch (direction) {
      case 'left':
        return [{ translateX: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-50, 0],
        }) }];
      case 'right':
        return [{ translateX: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0],
        }) }];
      case 'up':
        return [{ translateY: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [30, 0],
        }) }];
      case 'down':
        return [{ translateY: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-30, 0],
        }) }];
      default:
        return [];
    }
  };

  return {
    opacity: slideAnim,
    transform: getTransform(),
  };
};

export const useFloatingAnimation = (intensity: number = 10, duration: number = 3000) => {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: duration / 2,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [floatAnim, duration]);

  return {
    transform: [{
      translateY: floatAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -intensity],
      }),
    }],
  };
};

export const useScaleIn = (duration: number = 600, delay: number = 0) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [scaleAnim, duration, delay]);

  return {
    transform: [{ scale: scaleAnim }],
  };
};

export const usePulseAnimation = (intensity: number = 1.1, duration: number = 2000) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: intensity,
          duration: duration / 2,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [pulseAnim, duration, intensity]);

  return {
    transform: [{ scale: pulseAnim }],
  };
};
