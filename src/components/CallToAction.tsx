import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';

interface CallToActionProps {
  onGetStarted?: () => void;
}

const CallToAction: React.FC<CallToActionProps> = ({ onGetStarted }) => {
  const [isPressed, setIsPressed] = React.useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  return (
    <LinearGradient
      colors={['#6366f1', '#8b5cf6', '#ec4899']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Ready to Transform Your Coding Experience?</Text>
        <Text style={styles.subtitle}>
          Join thousands of developers who are already coding smarter and faster with CodeBuddy.
        </Text>
        <TouchableOpacity 
          style={[
            styles.button,
            isPressed && styles.buttonPressed
          ]} 
          onPress={onGetStarted}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          <Text style={styles.buttonText}>Get Started Free</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 60,
    alignItems: 'center',
  },
  content: {
    maxWidth: 600,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 44,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 26,
    opacity: 0.95,
  },
  button: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonPressed: {
    transform: [{ scale: 0.95 }],
    shadowOpacity: 0.4,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6366f1',
  },
});

export default CallToAction;
