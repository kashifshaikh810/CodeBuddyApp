import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';

interface HeaderProps {
  onSignIn?: () => void;
  onSignUp?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSignIn, onSignUp }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const navigation = useNavigation();
  const [pressedButton, setPressedButton] = React.useState<string | null>(null);

  const handlePressIn = (buttonName: string) => {
    setPressedButton(buttonName);
  };

  const handlePressOut = () => {
    setPressedButton(null);
  };

  const handleSignInPress = () => {
    navigation.navigate('Login' as never);
    onSignIn?.();
  };

  const handleSignUpPress = () => {
    navigation.navigate('SignUp' as never);
    onSignUp?.();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.logo}>
        <Text style={[styles.logoText, { color: colors.primary }]}>CodeBuddy</Text>
      </View>
      <View style={styles.buttons}>
        <TouchableOpacity 
          style={[
            styles.signInButton, 
            pressedButton === 'signIn' && styles.buttonPressed
          ]} 
          onPress={handleSignInPress}
          onPressIn={() => handlePressIn('signIn')}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
        >
          <Text style={[styles.signInText, { color: colors.primary }]}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.signUpButton, 
            pressedButton === 'signUp' && styles.signUpButtonPressed
          ]} 
          onPress={handleSignUpPress}
          onPressIn={() => handlePressIn('signUp')}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
        >
          <Text style={styles.signUpText}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.themeButton,
            pressedButton === 'theme' && styles.themeButtonPressed
          ]} 
          onPress={toggleTheme}
          onPressIn={() => handlePressIn('theme')}
          onPressOut={handlePressOut}
          activeOpacity={0.7}
        >
          <Text style={styles.themeButtonText}>{isDark ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logo: {
    flex: 1,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  signInButton: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 8,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  signInText: {
    fontSize: 16,
    fontWeight: '500',
  },
  signUpButton: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    backgroundColor: '#6366f1',
    borderRadius: 8,
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  signUpButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.95 }],
    shadowOpacity: 0.5,
  },
  signUpText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  themeButton: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  themeButtonPressed: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    transform: [{ scale: 0.9 }],
  },
  themeButtonText: {
    fontSize: 18,
  },
});

export default Header;
