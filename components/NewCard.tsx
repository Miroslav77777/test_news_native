import styled from 'styled-components/native';
import { CardContainer, CardTextContainer, CardTitleContainer, CardDateSourceContainer, CardImage } from '../styles/CardStyles';
import React, { useState } from 'react';
import { ActivityIndicator, TouchableOpacity, Linking } from 'react-native';

const Title = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #000000;
  text-align: left;
  width: 80%;
`;

const DateSource = styled.Text`
  font-size: 12px;
  color: #000000;
`;

const LoadingContainer = styled.View`
  position: absolute;
  left: -1;
  top: -1;
  width: 150px;
  height: 150px;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
  border-radius: 10px;
`;

const ErrorContainer = styled.View`
  position: absolute;
  left: -1;
  top: -1;
  width: 150px;
  height: 150px;
  justify-content: center;
  align-items: center;
  background-color: #ffebee;
  border-radius: 10px;
`;

interface NewCardProps {
  image?: string;
  title: string;
  date: string;
  source: string;
  url?: string;
}

const NewCard: React.FC<NewCardProps> = ({ image, title, date, source, url }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const handlePress = () => {
    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <CardContainer>
        {image && !imageError ? (
          <CardImage 
            source={{ uri: image }} 
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : null}
        
        {imageLoading && (
          <LoadingContainer>
            <ActivityIndicator size="small" color="#666" />
          </LoadingContainer>
        )}
        
        {imageError && (
          <ErrorContainer>
            <Title style={{fontSize: 12, textAlign: 'center'}}>Нет изображения</Title>
          </ErrorContainer>
        )}
        
        <CardTextContainer>
          <CardTitleContainer>
            <Title>{title}</Title>
          </CardTitleContainer>
          <CardDateSourceContainer>
            <DateSource>{source}</DateSource>
            <DateSource>{date}</DateSource>
          </CardDateSourceContainer>
        </CardTextContainer>
      </CardContainer>
    </TouchableOpacity>
  );
};

export default NewCard;