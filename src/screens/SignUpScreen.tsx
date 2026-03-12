import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  memo,
} from 'react';
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
  ActivityIndicator,
  TextInputProps,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useSlideIn, useScaleIn } from '../hooks/useAnimations';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SignupIllustration from '../components/SignupIllustration';
import VIPPopup from '../components/VIPPopup';
import DevPerformanceMonitor from '../components/DevPerformanceMonitor';
import { useRenderTracker } from '../components/useRenderTracker';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<any>;

type PopupType = 'success' | 'error' | 'info';

interface PopupState {
  visible: boolean;
  title: string;
  message: string;
  type: PopupType;
}

interface InputColors {
  text: string;
  textSecondary: string;
  border: string;
  cardBackground: string;
}

interface InputFieldProps extends TextInputProps {
  label: string;
  icon: string;
  colors: InputColors;
  secure?: boolean;
  showSecureToggle?: boolean;
  secureVisible?: boolean;
  onToggleSecure?: () => void;
}

const MemoSignupIllustration = memo(SignupIllustration);

const InputField = memo(
  ({
    label,
    icon,
    colors,
    secure = false,
    showSecureToggle = false,
    secureVisible = false,
    onToggleSecure,
    ...textInputProps
  }: InputFieldProps) => {
    return (
      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>{label}</Text>

        <View
          style={[
            styles.inputWrapper,
            {
              borderColor: colors.border,
              backgroundColor: colors.cardBackground,
            },
          ]}
        >
          <Text style={[styles.inputIcon, { color: colors.textSecondary }]}>
            {icon}
          </Text>

          <TextInput
            {...textInputProps}
            style={[
              styles.textInput,
              {
                backgroundColor: colors.cardBackground,
                color: colors.text,
              },
            ]}
            placeholderTextColor={colors.textSecondary}
            secureTextEntry={secure ? !secureVisible : false}
          />

          {showSecureToggle && (
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={onToggleSecure}
              activeOpacity={0.7}
            >
              <Text style={[styles.eyeText, { color: colors.textSecondary }]}>
                {secureVisible ? '👁️' : '👁️‍🗨️'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }
);

InputField.displayName = 'InputField';

const SignUpScreenComponent: React.FC = () => {

  const { colors } = useTheme();
  const { signup } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [popup, setPopup] = useState<PopupState>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const illustrationSlide = useSlideIn('left', 1000, 0);
  const formSlide = useSlideIn('right', 1000, 200);
  const formScale = useScaleIn(800, 300);
  const buttonScale = useScaleIn(600, 800);

  const inputColors = useMemo<InputColors>(
    () => ({
      text: colors.text,
      textSecondary: colors.textSecondary,
      border: colors.border,
      cardBackground: colors.cardBackground,
    }),
    [colors.text, colors.textSecondary, colors.border, colors.cardBackground]
  );

  const dynamicStyles = useMemo(
    () => ({
      containerBg: { backgroundColor: colors.background },
      bottomSectionBg: { backgroundColor: colors.background },
      titleColor: { color: colors.text },
      subtitleColor: { color: colors.textSecondary },
      signInTextColor: { color: colors.textSecondary },
      signInLinkColor: { color: colors.primary },
    }),
    [colors.background, colors.text, colors.textSecondary, colors.primary]
  );

  const showPopup = useCallback(
    (title: string, message: string, type: PopupType = 'info') => {
      setPopup({
        visible: true,
        title,
        message,
        type,
      });
    },
    []
  );

  const closePopup = useCallback(() => {
    setPopup(prev => ({ ...prev, visible: false }));
  }, []);

  const validateForm = useCallback(() => {
    if (
      !username.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      return {
        valid: false,
        title: 'Error',
        message: 'Please fill in all fields',
      };
    }

    if (password !== confirmPassword) {
      return {
        valid: false,
        title: 'Error',
        message: 'Passwords do not match',
      };
    }

    if (password.length < 6) {
      return {
        valid: false,
        title: 'Error',
        message: 'Password must be at least 6 characters long',
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        valid: false,
        title: 'Error',
        message: 'Please enter a valid email address',
      };
    }

    return { valid: true };
  }, [username, email, password, confirmPassword]);

  const handleCreateAccount = useCallback(async () => {
    if (isLoading) return;

    const validation = validateForm();

    if (!validation.valid) {
      showPopup(validation.title!, validation.message!, 'error');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signup(username.trim(), email.trim(), password);

      if (result.success) {
        showPopup('Success!', result.message, 'success');

        timeoutRef.current = setTimeout(() => {
          navigation.navigate('Login' as never);
        }, 2000);
      } else {
        showPopup('Registration Error', result.message, 'error');
      }
    } catch (error) {
      showPopup('Registration Error', 'An unexpected error occurred', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [
    isLoading,
    validateForm,
    signup,
    username,
    email,
    password,
    navigation,
    showPopup,
  ]);

  const handleSignIn = useCallback(() => {
    navigation.navigate('Login' as never);
  }, [navigation]);

  const toggleShowPassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const toggleShowConfirmPassword = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);


  return (
    <View style={[styles.container, dynamicStyles.containerBg]}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={styles.contentContainer}>
            <View style={styles.topSection}>
              <Animated.View style={illustrationSlide}>
                <MemoSignupIllustration />
              </Animated.View>
            </View>

            <View style={[styles.bottomSection, dynamicStyles.bottomSectionBg]}>
              <Animated.View style={[formSlide, formScale]}>
                <View style={styles.signupCard}>
                  <Text style={[styles.title, dynamicStyles.titleColor]}>
                    Create Account
                  </Text>

                  <Text style={[styles.subtitleText, dynamicStyles.subtitleColor]}>
                    Enter your information to create your account
                  </Text>

                  <InputField
                    label="Username"
                    icon="👤"
                    colors={inputColors}
                    placeholder="Enter your username"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                  />

                  <InputField
                    label="Email Address"
                    icon="✉️"
                    colors={inputColors}
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                  />

                  <InputField
                    label="Password"
                    icon="🔒"
                    colors={inputColors}
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secure={true}
                    showSecureToggle={true}
                    secureVisible={showPassword}
                    onToggleSecure={toggleShowPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                  />

                  <InputField
                    label="Confirm Password"
                    icon="🔒"
                    colors={inputColors}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secure={true}
                    showSecureToggle={true}
                    secureVisible={showConfirmPassword}
                    onToggleSecure={toggleShowConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleCreateAccount}
                  />

                  <Animated.View style={buttonScale}>
                    <TouchableOpacity
                      style={[
                        styles.createAccountButton,
                        isLoading && styles.disabledButton,
                      ]}
                      onPress={handleCreateAccount}
                      activeOpacity={0.9}
                      disabled={isLoading}
                    >
                      <LinearGradient
                        colors={
                          isLoading
                            ? ['#9ca3af', '#6b7280']
                            : ['#8b5cf6', '#6366f1']
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradientButton}
                      >
                        {isLoading ? (
                          <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                          <Text style={styles.createAccountButtonText}>
                            Create Account +
                          </Text>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animated.View>

                  <View style={styles.signInContainer}>
                    <Text
                      style={[
                        styles.signInText,
                        dynamicStyles.signInTextColor,
                      ]}
                    >
                      Already have an account?
                    </Text>

                    <TouchableOpacity onPress={handleSignIn} activeOpacity={0.7}>
                      <Text
                        style={[
                          styles.signInLink,
                          dynamicStyles.signInLinkColor,
                        ]}
                      >
                        Sign in
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

const SignUpScreen = memo(SignUpScreenComponent);
SignUpScreen.displayName = 'SignUpScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
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
  signupCard: {
    width: Math.min(width * 0.95, width < 400 ? 350 : 450),
    alignSelf: 'center',
  },
  title: {
    fontSize: width < 400 ? 28 : 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: width < 400 ? 14 : 16,
    marginBottom: width < 400 ? 24 : 32,
    lineHeight: width < 400 ? 20 : 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: width < 400 ? 16 : 20,
  },
  inputLabel: {
    fontSize: width < 400 ? 14 : 16,
    fontWeight: '500',
    marginBottom: 6,
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
  textInput: {
    flex: 1,
    paddingHorizontal: width < 400 ? 10 : 12,
    fontSize: width < 400 ? 14 : 16,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  eyeIcon: {
    paddingHorizontal: width < 400 ? 12 : 16,
  },
  eyeText: {
    fontSize: width < 400 ? 16 : 18,
  },
  createAccountButton: {
    marginBottom: width < 400 ? 18 : 24,
    borderRadius: 12,
    shadowColor: '#8b5cf6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
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
    flexDirection: 'row',
  },
  createAccountButtonText: {
    fontSize: width < 400 ? 14 : 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  signInText: {
    fontSize: width < 400 ? 12 : 14,
  },
  signInLink: {
    fontSize: width < 400 ? 12 : 14,
    fontWeight: '500',
  },
});

export default SignUpScreen;