import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Animated,
  TextInput,
  Modal,
  FlatList
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useFadeIn, useSlideIn } from '../hooks/useAnimations';
import axios from 'axios';
import RNFS from 'react-native-fs';
import { SafeAreaView } from 'react-native-safe-area-context';

// File-based storage for Hugging Face token
const hfStorage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      const filePath = `${RNFS.DocumentDirectoryPath}/${key}.json`;
      await RNFS.writeFile(filePath, value, 'utf8');
    } catch (error) {
      console.log('HF Storage setItem error:', error);
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      const filePath = `${RNFS.DocumentDirectoryPath}/${key}.json`;
      const exists = await RNFS.exists(filePath);

      if (!exists) return null;

      const value = await RNFS.readFile(filePath, 'utf8');
      return value;
    } catch (error) {
      console.log('HF Storage getItem error:', error);
      return null;
    }
  }
};

const { width, height } = Dimensions.get('window');

// const chatMessages = [
//   {
//     id: '1',
//     type: 'bot',
//     message: 'Hello! I\'m CodeBuddy, your AI coding assistant. How can I help you today?',
//     time: '10:30 AM',
//   },
//   {
//     id: '2',
//     type: 'user',
//     message: 'I need help with React Native navigation',
//     time: '10:31 AM',
//   },
//   {
//     id: '3',
//     type: 'bot',
//     message: 'I\'d be happy to help you with React Native navigation! Are you looking to implement stack navigation, tab navigation, or drawer navigation?',
//     time: '10:31 AM',
//   },
//   {
//     id: '4',
//     type: 'user',
//     message: 'Stack navigation between screens',

interface Message {
  id: string;
  type: 'user' | 'bot';
  message: string;
  time: string;
}

const DashboardScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [hfToken, setHfToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Animation values for loading dots
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.6)).current;
  const dot3Opacity = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  // Animation value for thinking text
  const thinkingTextOpacity = useRef(new Animated.Value(1)).current;

  // Load saved Hugging Face token
  useEffect(() => {
    const loadToken = async () => {
      const savedToken = await hfStorage.getItem('hfToken');
      if (savedToken) {
        setHfToken(savedToken);
      }
    };
    loadToken();
  }, []);


  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100); // Small delay to ensure message is rendered
    }
  }, [messages]);

  // Animation effect for loading dots and thinking text
  useEffect(() => {
    if (isLoading) {
      // Start thinking text pulsing animation
      const thinkingAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(thinkingTextOpacity, {
            toValue: 0.5,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(thinkingTextOpacity, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      thinkingAnimation.start();

      // Start dots wave animation - fixed version
      let animationRunning = true;
      const dotsAnimation = () => {
        if (!animationRunning) return;

        // Reset all dots to initial state
        dot1Opacity.setValue(0.3);
        dot2Opacity.setValue(0.3);
        dot3Opacity.setValue(0.3);

        Animated.parallel([
          // Dot 1: immediate
          Animated.sequence([
            Animated.timing(dot1Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(dot1Opacity, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          ]),
          // Dot 2: 200ms delay
          Animated.sequence([
            Animated.delay(200),
            Animated.timing(dot2Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(dot2Opacity, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          ]),
          // Dot 3: 400ms delay
          Animated.sequence([
            Animated.delay(400),
            Animated.timing(dot3Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(dot3Opacity, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          ]),
        ]).start(() => {
          // Continue the wave if still loading
          if (animationRunning && isLoading) {
            setTimeout(dotsAnimation, 100); // Small delay before next wave
          }
        });
      };
      dotsAnimation();

      // Store animation references for cleanup
      return () => {
        thinkingAnimation.stop();
        animationRunning = false; // Stop dots animation loop
        // Reset dot opacities
        dot1Opacity.setValue(0.3);
        dot2Opacity.setValue(0.3);
        dot3Opacity.setValue(0.3);
      };
    } else {
      // Reset all animations when not loading
      dot1Opacity.setValue(0.3);
      dot2Opacity.setValue(0.6);
      dot3Opacity.setValue(1);
      thinkingTextOpacity.setValue(1);
    }
  }, [isLoading]);

  // Animation hooks
  const headerFade = useFadeIn(800, 0);
  const chatSlide = useSlideIn('up', 1000, 200);

  const sendMessage = async () => {
    if (message.trim() === '' || isLoading) return;

    // Check if token is availab

    const newUserMessage: Message = {
      id: Date.now().toString(),
      type: 'user' as const,
      message: message.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      // Call Hugging Face Mistral AI API
      console.log('🤖 Sending message to Hugging Face:', message.trim());
      console.log('🔑 Using token:', hfToken.substring(0, 10) + '...');

      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "stepfun/step-3.5-flash:free",
          // model: "x-ai/grok-4.1-fast",
          // model: "meta-llama/llama-3.1-8b-instruct",
          // model: "openai/gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: message.trim()
            }
          ]
        },
        {
          headers: {
            Authorization: "Bearer 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",
            "Content-Type": "application/json"
          },
          timeout: 30000
        }
      );

      console.log('📥 OpenRouter Response:', response.data);

      // Extract response
      let botResponse =
        response.data?.choices?.[0]?.message?.content ||
        "No response received.";

      if (response.data && Array.isArray(response.data)) {
        botResponse = response.data[0]?.generated_text || response.data[0]?.text || 'Response received!';
      } else if (response.data?.generated_text) {
        botResponse = response.data.generated_text;
      } else if (response.data?.text) {
        botResponse = response.data.text;
      } else if (typeof response.data === 'string') {
        botResponse = response.data;
      }

      const newBotMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot' as const,
        message: botResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prevMessages => [...prevMessages, newBotMessage]);

    } catch (error: any) {
      console.log('❌ Hugging Face API Error:', error);
      console.log('❌ Error details:', error.message);
      console.log('❌ Error status:', error.response?.status);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot' as const,
        message: 'Sorry, I encountered an error. Please check your token and try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = (item: any) => (
    <View key={item.id} style={item.type === 'user' ? styles.userMessageContainer : styles.botMessageContainer}>
      <View style={[
        styles.messageBubble,
        item.type === 'user' && styles.userMessageBubble,
        { backgroundColor: item.type === 'user' ? colors.primary : colors.cardBackground }
      ]}>
        <Text style={[styles.messageText, { color: item.type === 'user' ? '#ffffff' : colors.text }]}>
          {item.message}
        </Text>
        <Text style={[styles.messageTime, { color: item.type === 'user' ? 'rgba(255,255,255,0.7)' : colors.textSecondary }]}>
          {item.time}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Animated.View style={[styles.header, headerFade]}>
        <LinearGradient
          colors={[colors.primary, colors.primary]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'CB'}
                </Text>
              </View>
              <View style={styles.headerInfo}>
                <Text style={styles.headerTitle}>
                  {user?.name ? `Welcome, ${user.name}` : 'CodeBuddy'}
                </Text>
                <Text style={styles.headerSubtitle}>
                  {user?.email ? user.email : 'AI Coding Assistant'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.settingsButton} onPress={logout}>
              <Text style={styles.settingsIcon}>🚪</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Content */}
      <Animated.View style={[styles.content, chatSlide]}>
          <View style={styles.chatContent}>
            <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false} ref={scrollViewRef}>
              {messages.length === 0 ? (
                <View style={styles.welcomeContainer}>
                  <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>
                    Welcome to CodeBuddy
                  </Text>
                  <Text style={[styles.welcomeSubtext, { color: colors.textSecondary }]}>
                    Your AI coding assistant is ready to help!
                  </Text>
                </View>
              ) : (
                messages.map(renderMessage)
              )}
              {isLoading && (
                <View style={styles.loadingContainer}>
                  <View style={[styles.loadingBubble, {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                  }]}>
                    <Animated.Text style={[styles.loadingText, { color: colors.text, opacity: thinkingTextOpacity }]}>
                      🤖 Thinking...
                    </Animated.Text>
                    <View style={styles.loadingDots}>
                      <Animated.View style={[styles.loadingDot, {
                        backgroundColor: colors.primary,
                        opacity: dot1Opacity,
                      }]} />
                      <Animated.View style={[styles.loadingDot, {
                        backgroundColor: colors.primary,
                        opacity: dot2Opacity,
                      }]} />
                      <Animated.View style={[styles.loadingDot, {
                        backgroundColor: colors.primary,
                        opacity: dot3Opacity,
                      }]} />
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
            <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                placeholder="Ask me anything..."
                placeholderTextColor={colors.textSecondary}
                value={message}
                onChangeText={setMessage}
                multiline
                onSubmitEditing={sendMessage}
              />
              <TouchableOpacity
                style={[styles.sendButton, { backgroundColor: colors.primary }]}
                onPress={sendMessage}
              >
                <Text style={styles.sendIcon}>🚀</Text>
              </TouchableOpacity>
            </View>
          </View>
      </Animated.View>
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 0,
  },
  headerGradient: {
    paddingHorizontal: width < 400 ? 15 : 20,
    paddingVertical: width < 400 ? 15 : 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: width < 400 ? 40 : 50,
    height: width < 400 ? 40 : 50,
    borderRadius: width < 400 ? 20 : 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: width < 400 ? 10 : 15,
  },
  avatarText: {
    fontSize: width < 400 ? 16 : 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: width < 400 ? 20 : 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: width < 400 ? 12 : 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  settingsButton: {
    width: width < 400 ? 32 : 40,
    height: width < 400 ? 32 : 40,
    borderRadius: width < 400 ? 16 : 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: width < 400 ? 14 : 18,
  },
  messageTime: {
    fontSize: width < 400 ? 10 : 11,
  },
  tokenButton: {
    width: width < 400 ? 32 : 40,
    height: width < 400 ? 32 : 40,
    borderRadius: width < 400 ? 16 : 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: width < 400 ? 8 : 10,
  },
  tokenIcon: {
    fontSize: width < 400 ? 14 : 18,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: width < 400 ? 15 : 20,
    marginTop: width < 400 ? 15 : 20,
    borderRadius: width < 400 ? 12 : 15,
    padding: width < 400 ? 3 : 4,
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: width < 400 ? 10 : 12,
    borderRadius: width < 400 ? 10 : 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  tabText: {
    fontSize: width < 400 ? 12 : 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    marginTop: width < 400 ? 15 : 20,
  },
  chatContent: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: width < 400 ? 15 : 20,
  },
  botMessageContainer: {
    flexDirection: 'row',
    marginBottom: width < 400 ? 10 : 15,
  },
  userMessageContainer: {
    flexDirection: 'row-reverse',
    marginBottom: width < 400 ? 10 : 15,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: width < 400 ? 12 : 15,
    borderRadius: width < 400 ? 15 : 20,
    borderBottomLeftRadius: width < 400 ? 4 : 5,
  },
  messageText: {
    fontSize: width < 400 ? 14 : 15,
    lineHeight: width < 400 ? 18 : 20,
    marginBottom: width < 400 ? 4 : 5,
  },
  userMessageBubble: {
    borderBottomLeftRadius: width < 400 ? 15 : 20,
    borderBottomRightRadius: width < 400 ? 4 : 5,
  },
  // Loading indicator styles
  loadingContainer: {
    flexDirection: 'row',
    marginBottom: width < 400 ? 10 : 15,
  },
  loadingBubble: {
    maxWidth: '80%',
    padding: width < 400 ? 12 : 15,
    borderRadius: width < 400 ? 15 : 20,
    borderBottomLeftRadius: width < 400 ? 4 : 5,
    borderWidth: 1,
  },
  loadingText: {
    fontSize: width < 400 ? 14 : 15,
    lineHeight: width < 400 ? 18 : 20,
    marginBottom: width < 400 ? 8 : 10,
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingDot: {
    width: width < 400 ? 6 : 8,
    height: width < 400 ? 6 : 8,
    borderRadius: width < 400 ? 3 : 4,
    marginHorizontal: width < 400 ? 2 : 3,
  },
  loadingDot1: {
    opacity: 0.3,
  },
  loadingDot2: {
    opacity: 0.6,
  },
  loadingDot3: {
    opacity: 1,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: width < 400 ? 60 : 80,
  },
  welcomeText: {
    fontSize: width < 400 ? 24 : 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: width < 400 ? 12 : 16,
  },
  welcomeSubtext: {
    fontSize: width < 400 ? 16 : 18,
    textAlign: 'center',
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    margin: width < 400 ? 15 : 20,
    borderRadius: width < 400 ? 20 : 25,
    borderWidth: 1,
    padding: width < 400 ? 4 : 5,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: width < 400 ? 12 : 15,
    paddingVertical: width < 400 ? 10 : 12,
    fontSize: width < 400 ? 14 : 16,
    maxHeight: width < 400 ? 80 : 100,
  },
  sendButton: {
    width: width < 400 ? 32 : 40,
    height: width < 400 ? 32 : 40,
    borderRadius: width < 400 ? 16 : 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: width < 400 ? 8 : 10,
  },
  sendIcon: {
    fontSize: width < 400 ? 14 : 16,
  },
  projectsContent: {
    flex: 1,
    paddingHorizontal: width < 400 ? 15 : 20,
  },
  toolsContent: {
    flex: 1,
    paddingHorizontal: width < 400 ? 15 : 20,
  },
  sectionTitle: {
    fontSize: width < 400 ? 18 : 22,
    fontWeight: 'bold',
    marginBottom: width < 400 ? 15 : 20,
  },
  projectsList: {
    gap: width < 400 ? 12 : 15,
  },
  projectCard: {
    padding: width < 400 ? 15 : 20,
    borderRadius: width < 400 ? 12 : 15,
    borderWidth: 1,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: width < 400 ? 12 : 15,
  },
  projectName: {
    fontSize: width < 400 ? 16 : 18,
    fontWeight: '600',
  },
  projectLanguage: {
    fontSize: width < 400 ? 12 : 14,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width < 400 ? 8 : 10,
  },
  progressBar: {
    flex: 1,
    height: width < 400 ? 6 : 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: width < 400 ? 3 : 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: width < 400 ? 3 : 4,
  },
  progressText: {
    fontSize: width < 400 ? 10 : 12,
    fontWeight: '500',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: width < 400 ? 12 : 15,
  },
  quickActionCard: {
    width: width < 400 ? '48%' : '48%',
    padding: width < 400 ? 15 : 20,
    borderRadius: width < 400 ? 12 : 15,
    borderWidth: 1,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: width < 400 ? 40 : 50,
    height: width < 400 ? 40 : 50,
    borderRadius: width < 400 ? 20 : 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: width < 400 ? 8 : 10,
  },
  quickActionIconText: {
    fontSize: width < 400 ? 20 : 24,
  },
  quickActionTitle: {
    fontSize: width < 400 ? 12 : 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    borderRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  tokenInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DashboardScreen;
