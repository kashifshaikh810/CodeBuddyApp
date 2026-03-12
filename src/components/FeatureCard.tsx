import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  onPress?: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, onPress }) => {
  const { colors } = useTheme();
  const [isPressed, setIsPressed] = React.useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  const Card = onPress ? TouchableOpacity : View;
  const cardProps = onPress ? {
    onPress,
    onPressIn: handlePressIn,
    onPressOut: handlePressOut,
    activeOpacity: 0.9,
  } : {};

  return (
    <Card 
      style={[
        styles.container, 
        { 
          backgroundColor: colors.cardBackground,
          shadowColor: colors.text,
          transform: [{ scale: isPressed ? 0.95 : 1 }]
        }
      ]} 
      {...cardProps}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.grayBackground }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    borderRadius: 16,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    alignItems: 'center',
    minHeight: 200,
    margin: 4,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    fontSize: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default FeatureCard;
