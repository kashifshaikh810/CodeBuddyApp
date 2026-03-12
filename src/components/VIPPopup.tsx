import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useFadeIn, useScaleIn } from '../hooks/useAnimations';

const { width, height } = Dimensions.get('window');

interface VIPPopupProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  buttonText?: string;
}

const VIPPopup: React.FC<VIPPopupProps> = ({
  visible,
  onClose,
  title,
  message,
  type = 'info',
  buttonText = 'OK',
}) => {
  const { colors } = useTheme();
  const fadeAnim = useFadeIn(300, 0);
  const scaleAnim = useScaleIn(300, 0);

  const getGradientColors = () => {
    switch (type) {
      case 'success':
        return ['#10b981', '#059669'];
      case 'error':
        return ['#ef4444', '#dc2626'];
      case 'info':
      default:
        return ['#6366f1', '#8b5cf6'];
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, fadeAnim, scaleAnim]}>
          <LinearGradient
            colors={getGradientColors()}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <Text style={styles.icon}>{getIcon()}</Text>
              <Text style={styles.title}>{title}</Text>
            </View>
          </LinearGradient>
          
          <View style={[styles.content, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.message, { color: colors.text }]}>
              {message}
            </Text>
            
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>{buttonText}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    width: Math.min(width * 0.9, 350),
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  headerGradient: {
    padding: 20,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  icon: {
    fontSize: 40,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  content: {
    padding: 25,
    alignItems: 'center',
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default VIPPopup;
