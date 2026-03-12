import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import FeatureCard from './FeatureCard';

const Features: React.FC = () => {
  const { colors } = useTheme();

  const features = [
    {
      icon: '💡',
      title: 'Technical Suggestions',
      description: 'Get smart technical suggestions and best practices for your code.',
    },
    {
      icon: '🚀',
      title: 'Code Suggestions',
      description: 'AI-powered code completion and suggestions to boost productivity.',
    },
    {
      icon: '🔧',
      title: 'Code Fixes',
      description: 'Automatically detect and fix bugs and issues in your code.',
    },
    {
      icon: '🎯',
      title: 'Problem Solving',
      description: 'Get help with complex coding problems and algorithms.',
    },
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Get instant responses and code suggestions in real-time.',
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description: 'Your code is secure and private with enterprise-grade encryption.',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.grayBackground }]}>
      <Text style={[styles.title, { color: colors.text }]}>Powerful Features</Text>
      <ScrollView 
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      >
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
});

export default Features;
