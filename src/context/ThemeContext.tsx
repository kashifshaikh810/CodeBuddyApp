import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import RNFS from 'react-native-fs';

// File-based storage for theme preference
const themeStorage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      const filePath = `${RNFS.DocumentDirectoryPath}/${key}.json`;
      await RNFS.writeFile(filePath, value, 'utf8');
      console.log(`✅ ${key} theme saved to file`);
    } catch (error) {
      console.log(`❌ Theme storage setItem error:`, error);
    }
  },
  
  async getItem(key: string): Promise<string | null> {
    try {
      const filePath = `${RNFS.DocumentDirectoryPath}/${key}.json`;
      const exists = await RNFS.exists(filePath);
      
      if (!exists) {
        console.log(`🔍 ${key} theme file not found`);
        return null;
      }
      
      const value = await RNFS.readFile(filePath, 'utf8');
      console.log(`🔍 ${key} theme loaded from file`);
      return value;
    } catch (error) {
      console.log(`❌ Theme storage getItem error:`, error);
      return null;
    }
  },
};

export type Theme = 'light' | 'dark';

interface ThemeColors {
  background: string;
  cardBackground: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  primaryGradient: string[];
  white: string;
  grayBackground: string;
}

const lightTheme: ThemeColors = {
  background: '#ffffff',
  cardBackground: '#ffffff',
  text: '#1f2937',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
  primary: '#6366f1',
  primaryGradient: ['#6366f1', '#8b5cf6', '#ec4899'],
  white: '#ffffff',
  grayBackground: '#f9fafb',
};

const darkTheme: ThemeColors = {
  background: '#111827',
  cardBackground: '#1f2937',
  text: '#f9fafb',
  textSecondary: '#d1d5db',
  border: '#374151',
  primary: '#6366f1',
  primaryGradient: ['#6366f1', '#8b5cf6', '#ec4899'],
  white: '#ffffff',
  grayBackground: '#1f2937',
};

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>('light');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved theme on app start
  useEffect(() => {
    const loadTheme = async () => {
      try {
        console.log('🎨 Loading saved theme...');
        const savedTheme = await themeStorage.getItem('theme');
        
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
          console.log(`✅ Using saved theme: ${savedTheme}`);
          setTheme(savedTheme);
        } else {
          console.log(`🎨 Using device theme: ${deviceTheme}`);
          setTheme(deviceTheme === 'light' || deviceTheme === 'dark' ? deviceTheme : 'light');
        }
      } catch (error) {
        console.log('❌ Error loading theme:', error);
        setTheme(deviceTheme === 'light' || deviceTheme === 'dark' ? deviceTheme : 'light');
      } finally {
        setIsInitialized(true);
      }
    };

    loadTheme();
  }, [deviceTheme]);

  // Save theme whenever it changes
  useEffect(() => {
    if (isInitialized) {
      const saveTheme = async () => {
        try {
          console.log(`💾 Saving theme: ${theme}`);
          await themeStorage.setItem('theme', theme);
          console.log(`✅ Theme saved successfully`);
        } catch (error) {
          console.log('❌ Error saving theme:', error);
        }
      };

      saveTheme();
    }
  }, [theme, isInitialized]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log(`🔄 Toggling theme from ${theme} to ${newTheme}`);
    setTheme(newTheme);
  };

  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};
