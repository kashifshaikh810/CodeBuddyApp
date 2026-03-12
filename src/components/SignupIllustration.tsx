import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useFloatingAnimation, usePulseAnimation } from '../hooks/useAnimations';

const SignupIllustration: React.FC = () => {
  const { colors } = useTheme();
  const floatingAnim = useFloatingAnimation(10, 5000);
  const pulseAnim = usePulseAnimation(1.03, 3500);

  return (
    <Animated.View style={[styles.container, floatingAnim]}>
      {/* Futuristic Room with Screens */}
      <View style={styles.roomContainer}>
        {/* Background Grid */}
        <View style={styles.backgroundGrid}>
          {[...Array(8)].map((_, i) => (
            <View key={i} style={styles.gridRow}>
              {[...Array(6)].map((_, j) => (
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

        {/* Central Holographic Interface */}
        <View style={styles.holographicContainer}>
          <Animated.View style={[styles.holographicCircle, { borderColor: colors.primary }, pulseAnim]} />
          <View style={[styles.holographicInner, { backgroundColor: colors.primary, opacity: 0.3 }]} />
          <View style={[styles.holographicCore, { backgroundColor: colors.primary }]} />
          
          {/* Floating Data Points */}
          <View style={[styles.dataPoint, styles.data1, { backgroundColor: colors.primary }]} />
          <View style={[styles.dataPoint, styles.data2, { backgroundColor: colors.textSecondary }]} />
          <View style={[styles.dataPoint, styles.data3, { backgroundColor: colors.primary }]} />
          <View style={[styles.dataPoint, styles.data4, { backgroundColor: colors.textSecondary }]} />
          
          {/* Connection Lines */}
          <View style={[styles.connectionLine, styles.conn1, { backgroundColor: colors.primary }]} />
          <View style={[styles.connectionLine, styles.conn2, { backgroundColor: colors.textSecondary }]} />
          <View style={[styles.connectionLine, styles.conn3, { backgroundColor: colors.primary }]} />
        </View>

        {/* Side Screens */}
        <View style={[styles.screen, styles.screen1, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={styles.screenContent}>
            <View style={[styles.codeLine, { backgroundColor: colors.primary }]} />
            <View style={[styles.codeLine, styles.lineShort, { backgroundColor: colors.textSecondary }]} />
            <View style={[styles.codeLine, { backgroundColor: colors.primary }]} />
            <View style={[styles.codeLine, styles.lineMedium, { backgroundColor: colors.textSecondary }]} />
          </View>
        </View>
        
        <View style={[styles.screen, styles.screen2, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={styles.dataViz}>
            <View style={[styles.vizBar, styles.bar1, { backgroundColor: colors.primary }]} />
            <View style={[styles.vizBar, styles.bar2, { backgroundColor: colors.textSecondary }]} />
            <View style={[styles.vizBar, styles.bar3, { backgroundColor: colors.primary }]} />
            <View style={[styles.vizBar, styles.bar4, { backgroundColor: colors.textSecondary }]} />
          </View>
        </View>

        {/* Brain Object */}
        <View style={styles.brainContainer}>
          <View style={[styles.brainCore, { backgroundColor: colors.primary, opacity: 0.8 }]} />
          <View style={[styles.brainNeural, styles.neural1, { borderColor: colors.primary }]} />
          <View style={[styles.brainNeural, styles.neural2, { borderColor: colors.primary }]} />
          <View style={[styles.brainNeural, styles.neural3, { borderColor: colors.primary }]} />
          <View style={[styles.brainNeural, styles.neural4, { borderColor: colors.primary }]} />
        </View>

        {/* Glowing Hand */}
        <View style={styles.handContainer}>
          <View style={[styles.handPalm, { backgroundColor: colors.primary, opacity: 0.6 }]} />
          <View style={[styles.handFinger, styles.finger1, { backgroundColor: colors.primary }]} />
          <View style={[styles.handFinger, styles.finger2, { backgroundColor: colors.primary }]} />
          <View style={[styles.handFinger, styles.finger3, { backgroundColor: colors.primary }]} />
          <View style={[styles.handFinger, styles.finger4, { backgroundColor: colors.primary }]} />
          <View style={[styles.handFinger, styles.finger5, { backgroundColor: colors.primary }]} />
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
  roomContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundGrid: {
    position: 'absolute',
    opacity: 0.1,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  gridDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  holographicContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  holographicCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  holographicInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    position: 'absolute',
  },
  holographicCore: {
    width: 60,
    height: 60,
    borderRadius: 30,
    position: 'absolute',
  },
  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  data1: { top: 20, left: 40 },
  data2: { top: 40, right: 30 },
  data3: { bottom: 30, left: 50 },
  data4: { bottom: 20, right: 40 },
  connectionLine: {
    position: 'absolute',
    height: 1,
    borderRadius: 0.5,
  },
  conn1: { width: 60, top: 60, left: 20, transform: [{ rotate: '30deg' }] },
  conn2: { width: 80, bottom: 80, right: 10, transform: [{ rotate: '-45deg' }] },
  conn3: { width: 50, top: 100, right: 40, transform: [{ rotate: '60deg' }] },
  screen: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  screen1: {
    width: 80,
    height: 100,
    top: '15%',
    left: '10%',
  },
  screen2: {
    width: 80,
    height: 100,
    top: '20%',
    right: '10%',
  },
  screenContent: {
    flex: 1,
    justifyContent: 'space-around',
  },
  codeLine: {
    height: 2,
    borderRadius: 1,
    marginBottom: 4,
  },
  lineShort: { width: '60%' },
  lineMedium: { width: '80%' },
  dataViz: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  vizBar: {
    width: 6,
    borderRadius: 3,
  },
  bar1: { height: '20%' },
  bar2: { height: '40%' },
  bar3: { height: '60%' },
  bar4: { height: '30%' },
  brainContainer: {
    position: 'absolute',
    bottom: '15%',
    left: '20%',
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brainCore: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  brainNeural: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  neural1: { width: 20, height: 20, top: -5, left: -5 },
  neural2: { width: 20, height: 20, top: -5, right: -5 },
  neural3: { width: 20, height: 20, bottom: -5, left: -5 },
  neural4: { width: 20, height: 20, bottom: -5, right: -5 },
  handContainer: {
    position: 'absolute',
    top: '50%',
    right: '25%',
    width: 80,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  handPalm: {
    width: 40,
    height: 50,
    borderRadius: 20,
  },
  handFinger: {
    position: 'absolute',
    width: 8,
    borderRadius: 4,
  },
  finger1: { height: 30, top: -25, left: 6 },
  finger2: { height: 35, top: -30, left: 16 },
  finger3: { height: 32, top: -27, left: 26 },
  finger4: { height: 28, top: -23, left: 6 },
  finger5: { height: 30, top: -25, right: 6 },
});

export default SignupIllustration;
