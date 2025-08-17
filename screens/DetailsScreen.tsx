import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ParallaxHeader from '../components/ParallaxHeader';

const DetailsScreen = ({ route }) => {
  const { title, image, description, content } = route.params;

  return (
    <ParallaxHeader image={image} title={title}>
      <View style={styles.content}>
        <Text style={styles.description}>{description}</Text>
        <Text style={styles.contentText}>{content}</Text>
        {/* Добавьте здесь остальной контент новости */}
      </View>
    </ParallaxHeader>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 20,
  },
  contentText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
  },
});

export default DetailsScreen; 