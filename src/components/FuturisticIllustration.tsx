import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useFloatingAnimation, usePulseAnimation } from '../hooks/useAnimations';

const FuturisticIllustration: React.FC = () => {
  const { colors } = useTheme();
  const floatingAnim = useFloatingAnimation(8, 4000);
  const pulseAnim = usePulseAnimation(1.05, 3000);

  return (
    <Animated.View style={[styles.container, floatingAnim]}>
      {/* Futuristic Abstract Illustration */}
      <View style={styles.illustrationContainer}>
        {/* Central Circle */}
        <Animated.View style={[styles.centralCircle, { borderColor: colors.primary }, pulseAnim]} />
        
        {/* Orbiting Elements */}
        <View style={[styles.orbit, styles.orbit1]}>
          <View style={[styles.orbitDot, { backgroundColor: colors.primary }]} />
        </View>
        <View style={[styles.orbit, styles.orbit2]}>
          <View style={[styles.orbitDot, { backgroundColor: colors.textSecondary }]} />
        </View>
        <View style={[styles.orbit, styles.orbit3]}>
          <View style={[styles.orbitDot, { backgroundColor: colors.primary }]} />
        </View>
        
        {/* Connection Lines */}
        <View style={[styles.connectionLine, styles.line1, { backgroundColor: colors.primary }]} />
        <View style={[styles.connectionLine, styles.line2, { backgroundColor: colors.textSecondary }]} />
        <View style={[styles.connectionLine, styles.line3, { backgroundColor: colors.primary }]} />
        
        {/* Floating Elements */}
        <View style={[styles.floatingElement, styles.element1, { backgroundColor: colors.primary }]} />
        <View style={[styles.floatingElement, styles.element2, { backgroundColor: colors.textSecondary }]} />
        <View style={[styles.floatingElement, styles.element3, { backgroundColor: colors.primary }]} />
        
        {/* Grid Pattern */}
        <View style={styles.gridPattern}>
          {[...Array(6)].map((_, i) => (
            <View key={i} style={styles.gridRow}>
              {[...Array(4)].map((_, j) => (
                <View 
                  key={j} 
                  style={[
                    styles.gridDot, 
                    { backgroundColor: (i + j) % 2 === 0 ? colors.primary : colors.textSecondary }
                  ]} 
                />
              ))}
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  illustrationContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centralCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    backgroundColor: 'transparent',
  },
  orbit: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 100,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  orbit1: {
    width: 180,
    height: 180,
  },
  orbit2: {
    width: 240,
    height: 240,
  },
  orbit3: {
    width: 300,
    height: 300,
  },
  orbitDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: -4,
  },
  connectionLine: {
    position: 'absolute',
    height: 2,
    borderRadius: 1,
  },
  line1: {
    width: 80,
    top: '40%',
    left: '20%',
    transform: [{ rotate: '45deg' }],
  },
  line2: {
    width: 60,
    top: '60%',
    right: '25%',
    transform: [{ rotate: '-30deg' }],
  },
  line3: {
    width: 100,
    bottom: '30%',
    left: '30%',
    transform: [{ rotate: '15deg' }],
  },
  floatingElement: {
    position: 'absolute',
    borderRadius: 4,
  },
  element1: {
    width: 16,
    height: 16,
    top: '20%',
    left: '15%',
  },
  element2: {
    width: 12,
    height: 12,
    top: '70%',
    right: '20%',
  },
  element3: {
    width: 20,
    height: 20,
    bottom: '25%',
    left: '25%',
  },
  gridPattern: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    opacity: 0.3,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  gridDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});

export default FuturisticIllustration;
