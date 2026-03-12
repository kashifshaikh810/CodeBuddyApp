import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Animated,
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useFadeIn, useSlideIn, useScaleIn } from '../hooks/useAnimations';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import FuturisticIllustration from '../components/FuturisticIllustration';
import VIPPopup from '../components/VIPPopup';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

interface LoginScreenProps {
  onBack?: () => void;
}

type NavigationProp = NativeStackNavigationProp<any>;

const LoginScreen: React.FC<LoginScreenProps> = ({ onBack }) => {
  const { colors, isDark } = useTheme();
  const { login } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [popup, setPopup] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info',
  });

  // Animation hooks
  const illustrationSlide = useSlideIn('left', 1000, 0);
  const formSlide = useSlideIn('right', 1000, 200);
  const formScale = useScaleIn(800, 300);
  const buttonScale = useScaleIn(600, 600);

  const showPopup = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setPopup({ visible: true, title, message, type });
  };

  const closePopup = () => {
    setPopup(prev => ({ ...prev, visible: false }));
  };

  const handleSignIn = async () => {
    // Validation
    if (!email.trim() || !password.trim()) {
      showPopup('Error', 'Please fill in all fields', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showPopup('Error', 'Please enter a valid email address', 'error');
      return;
    }

    if (password.length < 6) {
      showPopup('Error', 'Password must be at least 6 characters long', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        showPopup('Welcome Back!', result.message, 'success');
        // Navigation will be handled automatically by AuthNavigator
      } else {
        showPopup('Login Error', result.message, 'error');
      }
    } catch (error: any) {
      showPopup('Login Error', 'An unexpected error occurred', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = () => {
    navigation.navigate('SignUp' as never);
  };

  const handlePressIn = () => {
    setIsPressed(true);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.contentContainer}>
            {/* Top Section - Illustration */}
            <View style={styles.topSection}>
              <Animated.View style={[illustrationSlide]}>
                <FuturisticIllustration />
              </Animated.View>
            </View>

            {/* Bottom Section - Login Form */}
            <View style={[styles.bottomSection, { backgroundColor: colors.background }]}>
              <Animated.View style={[formSlide, formScale]}>
                <View style={styles.loginCard}>
                  <Text style={[styles.welcomeText, { color: colors.text }]}>
                    Welcome Back
                  </Text>
                  <Text style={[styles.subtitleText, { color: colors.textSecondary }]}>
                    Enter your credentials to access your account
                  </Text>

                  {/* Email Input */}
                  <View style={styles.inputContainer}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>Email Address</Text>
                    <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.cardBackground }]}>
                      <Text style={[styles.inputIcon, { color: colors.textSecondary }]}>✉️</Text>
                      <TextInput
                        style={[
                          styles.textInput,
                          { 
                            backgroundColor: 'transparent',
                            color: colors.text,
                          }
                        ]}
                        placeholder="Enter your email"
                        placeholderTextColor={colors.textSecondary}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                  </View>

                  {/* Password Input */}
                  <View style={styles.inputContainer}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>Password</Text>
                    <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.cardBackground }]}>
                      <Text style={[styles.inputIcon, { color: colors.textSecondary }]}>🔒</Text>
                      <TextInput
                        style={[
                          styles.textInput,
                          { 
                            backgroundColor: 'transparent',
                            color: colors.text,
                          }
                        ]}
                        placeholder="Enter your password"
                        placeholderTextColor={colors.textSecondary}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                      />
                      <TouchableOpacity 
                        style={styles.eyeIcon}
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        <Text style={[styles.eyeText, { color: colors.textSecondary }]}>
                          {showPassword ? '👁️' : '👁️‍🗨️'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Sign In Button */}
                  <Animated.View style={[buttonScale]}>
                    <TouchableOpacity
                      style={[
                        styles.signInButton,
                        isPressed && styles.signInButtonPressed,
                        isLoading && styles.disabledButton
                      ]}
                      onPress={handleSignIn}
                      onPressIn={!isLoading ? handlePressIn : undefined}
                      onPressOut={!isLoading ? handlePressOut : undefined}
                      activeOpacity={0.9}
                      disabled={isLoading}
                    >
                      <LinearGradient
                        colors={isLoading ? ['#9ca3af', '#6b7280'] : ['#6366f1', '#8b5cf6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradientButton}
                      >
                        {isLoading ? (
                          <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                          <Text style={styles.signInButtonText}>Sign In</Text>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animated.View>

                  {/* Create Account Link */}
                  <View style={styles.createAccountContainer}>
                    <Text style={[styles.createAccountText, { color: colors.textSecondary }]}>
                      Don't have an account?
                    </Text>
                    <TouchableOpacity onPress={handleCreateAccount}>
                      <Text style={[styles.createAccountLink, { color: colors.primary }]}>
                        Create account
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <VIPPopup
        visible={popup.visible}
        onClose={closePopup}
        title={popup.title}
        message={popup.message}
        type={popup.type}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
    minHeight: height,
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: height * 0.4,
    paddingHorizontal: width < 400 ? 10 : 20,
  },
  bottomSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width < 400 ? 10 : 20,
  },
  loginCard: {
    width: Math.min(width * 0.95, width < 400 ? 350 : 450),
    alignSelf: 'center',
  },
  welcomeText: {
    fontSize: width < 400 ? 28 : 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: width < 400 ? 14 : 16,
    marginBottom: width < 400 ? 30 : 40,
    lineHeight: width < 400 ? 20 : 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: width < 400 ? 18 : 24,
  },
  inputLabel: {
    fontSize: width < 400 ? 14 : 16,
    fontWeight: '500',
    marginBottom: 6,
  },
  textInput: {
    flex: 1,
    height: width < 400 ? 48 : 56,
    fontSize: width < 400 ? 14 : 16,
    paddingHorizontal: width < 400 ? 8 : 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    height: width < 400 ? 48 : 56,
    width: '100%',
  },
  inputIcon: {
    paddingHorizontal: width < 400 ? 8 : 10,
    fontSize: width < 400 ? 16 : 18,
  },
  eyeIcon: {
    paddingHorizontal: width < 400 ? 12 : 16,
  },
  eyeText: {
    fontSize: width < 400 ? 16 : 18,
  },
  signInButton: {
    marginBottom: width < 400 ? 18 : 24,
    borderRadius: 12,
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  signInButtonPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.4,
  },
  disabledButton: {
    opacity: 0.6,
    shadowOpacity: 0,
  },
  gradientButton: {
    height: width < 400 ? 48 : 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInButtonText: {
    fontSize: width < 400 ? 14 : 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  createAccountContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  createAccountText: {
    fontSize: width < 400 ? 12 : 14,
  },
  createAccountLink: {
    fontSize: width < 400 ? 12 : 14,
    fontWeight: '500',
  },
});

export default LoginScreen;
