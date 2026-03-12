import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useFadeIn, useSlideIn } from '../hooks/useAnimations';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import CallToAction from '../components/CallToAction';
import Footer from '../components/Footer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRenderTracker } from '../components/useRenderTracker';

const { width: screenWidth } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
    useRenderTracker('HomeScreen');
  
  const { colors } = useTheme();
  const scrollRef = React.useRef<ScrollView>(null);

  // Animation hooks
  const headerFade = useFadeIn(800, 0);
  const heroSlide = useSlideIn('up', 1000, 200);
  const featuresSlide = useSlideIn('up', 1200, 400);
  const ctaSlide = useSlideIn('up', 1000, 600);
  const footerFade = useFadeIn(800, 800);

  const handleSignIn = () => {
    console.log('Sign In pressed');
  };

  const handleSignUp = () => {
    console.log('Sign Up pressed');
  };

  const handleStartCoding = () => {
    console.log('Start Coding pressed');
    // Scroll to features section
    scrollRef.current?.scrollTo({ y: 450, animated: true });
  };

  const handleGetStarted = () => {
    console.log('Get Started pressed');
  };

  const handleFeaturePress = (featureTitle: string) => {
    console.log(`${featureTitle} pressed`);
  };

  return (
    <SafeAreaView style={styles.container}>
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        <Animated.View style={[headerFade]}>
          <Header onSignIn={handleSignIn} onSignUp={handleSignUp} />
        </Animated.View>
        
        <Animated.View style={[heroSlide]}>
          <Hero onStartCoding={handleStartCoding} />
        </Animated.View>
        
        <Animated.View style={[featuresSlide]}>
          <Features />
        </Animated.View>
        
        <Animated.View style={[ctaSlide]}>
          <CallToAction onGetStarted={handleGetStarted} />
        </Animated.View>
        
        <Animated.View style={[footerFade]}>
          <Footer />
        </Animated.View>
      </ScrollView>
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
});

export default HomeScreen;
