/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NavigationContainer } from '@react-navigation/native';
import { StatusBar, useColorScheme } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import React from 'react';
import DevPerformanceMonitor from './src/components/DevPerformanceMonitor';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationContainer>
          <SafeAreaProvider>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            {__DEV__ && (
              <DevPerformanceMonitor watch={['HomeScreen', 'HomeIllustration']} />
            )}
            <AppNavigator />
          </SafeAreaProvider>
        </NavigationContainer>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
