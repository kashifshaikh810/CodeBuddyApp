import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import axios from 'axios';
import RNFS from 'react-native-fs';

// File-based storage implementation using react-native-fs
const storage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      const filePath = `${RNFS.DocumentDirectoryPath}/${key}.json`;
      await RNFS.writeFile(filePath, value, 'utf8');
      console.log(`✅ ${key} saved to file:`, filePath);
    } catch (error) {
      console.log(`❌ File storage setItem error for ${key}:`, error);
      throw error;
    }
  },
  
  async getItem(key: string): Promise<string | null> {
    try {
      const filePath = `${RNFS.DocumentDirectoryPath}/${key}.json`;
      const exists = await RNFS.exists(filePath);
      
      if (!exists) {
        console.log(`🔍 ${key} file not found`);
        return null;
      }
      
      const value = await RNFS.readFile(filePath, 'utf8');
      console.log(`🔍 ${key} loaded from file`);
      return value;
    } catch (error) {
      console.log(`❌ File storage getItem error for ${key}:`, error);
      return null;
    }
  },
  
  async removeItem(key: string): Promise<void> {
    try {
      const filePath = `${RNFS.DocumentDirectoryPath}/${key}.json`;
      const exists = await RNFS.exists(filePath);
      
      if (exists) {
        await RNFS.unlink(filePath);
        console.log(`✅ ${key} file deleted`);
      } else {
        console.log(`🔍 ${key} file not found for deletion`);
      }
    } catch (error) {
      console.log(`❌ File storage removeItem error for ${key}:`, error);
      throw error;
    }
  }
};

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signup: (username: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  // Set up axios interceptor for authenticated requests
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Axios headers set with token');
    } else {
      delete axios.defaults.headers.common['Authorization'];
      console.log('Axios headers cleared');
    }
  }, [token]);

  // Check for existing token on app start
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        console.log('=== Checking Auth Status ===');
        
        const storedToken = await storage.getItem('authToken');
        console.log('Token exists:', !!storedToken);
        
        if (storedToken) {
          console.log('Token found, staying logged in');
          setToken(storedToken);
          
          // Try to get user data
          const storedUser = await storage.getItem('userData');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
            console.log('User data loaded');
          }
        } else {
          console.log('No token found, user needs to login');
        }
      } catch (error) {
        console.log('Error checking auth:', error);
      } finally {
        console.log('=== Auth Check Complete ===');
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  const fetchUserWithToken = async (authToken: string) => {
    try {
      const response = await axios.get('https://minimalblog-three.vercel.app/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        timeout: 10000,
      });

      console.log('=== Fetch User Response ===');
      console.log('Response data:', response.data);

      // Handle response format: { success: true, user: {...} }
      if (response.data && response.data.success && response.data.user) {
        const userData = response.data.user;
        console.log('User data fetched successfully:', userData);
        
        // Update state and storage
        setUser(userData);
        try {
          await storage.setItem('userData', JSON.stringify(userData));
          console.log('✅ User data updated in storage');
        } catch (storageError) {
          console.log('❌ Failed to update user data in storage:', storageError);
        }
      } else {
        console.log('❌ Invalid fetch user response format');
        console.log('Response keys:', Object.keys(response.data || {}));
      }
    } catch (error) {
      console.log('Error fetching user data:', error);
      // Token might be invalid, clear auth
      await logout();
    }
  };

  const fetchUser = async () => {
    if (!token) return;
    await fetchUserWithToken(token);
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('=== Attempting Login ===');
      console.log('Email:', email);
      
      const response = await axios.post('https://minimalblog-three.vercel.app/api/auth/login', {
        email: email.trim(),
        password: password.trim(),
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      console.log('=== Login Response Received ===');
      console.log('Status:', response.status);
      console.log('Response data:', response.data);

      // Token will be in the response body from server
      if (response.data?.user) {
        // Handle your specific response format: { data: { user: {...}, token: "..." } }
        let authToken = null;
        let userData = null;
        
        if (response?.data?.user && response.data.user?.id) {
          // Your server format: { data: { user: {...}, token: "..." } }
          authToken = response.data.user?.id;
          userData = response.data.user;
        } else {
          // Fallback to other formats
          authToken = response.data.token || 
                     response.data.access_token || 
                     response.data.jwt || 
                     response.data.authToken;
          userData = response.data.user;
        }
        
        // If the entire response is just a string token
        if (typeof response.data === 'string') {
          authToken = response.data;
        }
        
        console.log('Extracted token:', !!authToken);
        console.log('Extracted user:', !!userData);
        
        if (authToken) {
          console.log('=== Login Success ===');
          
          // Use server user data or create fallback
          const finalUserData = userData || { 
            username: userData?.name, 
            email: email,
            id: '1'
          };
          
          console.log('User data:', finalUserData);
          
          // Set state
          setToken(authToken);
          setUser(finalUserData);
          
          // Save to storage
          console.log('💾 Saving login data to AsyncStorage...');
          
          try {
            await storage.setItem('authToken', authToken);
            await storage.setItem('userData', JSON.stringify(finalUserData));
            console.log('✅ All login data saved to AsyncStorage');
          } catch (storageError) {
            console.log('❌ AsyncStorage save error:', storageError);
            return { success: false, message: 'Failed to save login data' };
          }
          
          console.log('✅ Token and user saved to storage');
          console.log('=== Login Complete ===');

          return { success: true, message: 'Login successful!' };
        } else {
          console.log('❌ No token found in response');
          console.log('Available fields:', Object.keys(response.data));
          return { success: false, message: 'No token received from server' };
        }
      } else {
        console.log('❌ No response data');
        return { success: false, message: 'No response from server' };
      }
    } catch (error: any) {
      console.log('=== Login Error ===');
      console.log('Error:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Connection timeout. Please check your internet connection.';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.response) {
        console.log('Error response:', error.response.status, error.response.data);
        switch (error.response.status) {
          case 400:
            errorMessage = error.response.data?.message || 'Invalid credentials';
            break;
          case 401:
            errorMessage = 'Invalid email or password';
            break;
          case 404:
            errorMessage = 'User not found. Please check your email or sign up';
            break;
          case 422:
            errorMessage = error.response.data?.message || 'Validation error';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = error.response.data?.message || `Error: ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      }

      return { success: false, message: errorMessage };
    }
  };

  const signup = async (username: string, email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axios.post('https://minimalblog-three.vercel.app/api/auth/register', {
        name: username.trim(),
        email: email.trim(),
        password: password.trim(),
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      return { success: true, message: 'Account created successfully! Please login.' };
    } catch (error: any) {
      console.log('Signup Error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Connection timeout. Please check your internet connection.';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage = error.response.data?.message || 'Invalid input data';
            break;
          case 409:
            errorMessage = 'User with this email already exists';
            break;
          case 422:
            errorMessage = error.response.data?.message || 'Validation error';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = error.response.data?.message || `Error: ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      }

      return { success: false, message: errorMessage };
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out...');
      
      // Clear local state
      setUser(null);
      setToken(null);
      
      // Clear AsyncStorage
      console.log('🗑️ Clearing AsyncStorage...');
      await storage.removeItem('authToken');
      await storage.removeItem('userData');
      
      // Clear axios headers
      delete axios.defaults.headers.common['Authorization'];
      
      console.log('✅ Logged out successfully');
    } catch (error) {
      console.log('❌ Error during logout:', error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    fetchUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
