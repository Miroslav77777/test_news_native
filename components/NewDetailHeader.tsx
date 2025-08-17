import styled from 'styled-components/native';
import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';

interface ImageProps {
    image?: string;
    title: string;
}

const HeaderContainer = styled.View`
    width: 100%;
    height: 300px;
    position: relative;
`;

const FastHeaderImage = styled(FastImage)`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
`;

const HeaderOverlay = styled.View`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.4);
`;

const HeaderContent = styled.View`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20px;
    padding-bottom: 30px;
`;

const HeaderTitle = styled.Text`
    color: #ffffff;
    font-size: 24px;
    font-weight: bold;
    line-height: 32px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;

const BackButton = styled.TouchableOpacity`
    position: absolute;
    top: 50px;
    left: 20px;
    background-color: rgba(0, 0, 0, 0.3);
    padding: 10px 15px;
    border-radius: 20px;
    z-index: 10;
`;

const BackText = styled.Text`
    color: #ffffff;
    font-size: 16px;
    font-weight: bold;
`;

const FallbackHeader = styled.View`
    width: 100%;
    height: 300px;
    background-color: #1976d2;
    justify-content: center;
    align-items: center;
`;

const FallbackText = styled.Text`
    color: #ffffff;
    font-size: 18px;
    font-weight: bold;
`;

const NewDetailHeader: React.FC<ImageProps> = ({ image, title }) => {
    const navigation = useNavigation();

    const handleBack = () => {
        navigation.goBack();
    };

    console.log(image);

    if (!image) {
        return (
            <FallbackHeader>
                <BackButton onPress={handleBack}>
                    <BackText>← Назад</BackText>
                </BackButton>
                <FallbackText>{title}</FallbackText>
            </FallbackHeader>
        );
    }

    return (
        <HeaderContainer>
            <FastHeaderImage 
                style={{width: '100%', height: '100%'}}
                source={{ 
                    uri: image,
                    priority: FastImage.priority.high,
                    cache: FastImage.cacheControl.immutable
                }} 
                resizeMode={FastImage.resizeMode.cover}
            />
            <HeaderOverlay />
            
            <BackButton onPress={handleBack}>
                <BackText>← Назад</BackText>
            </BackButton>
            
            <HeaderContent>
                <HeaderTitle>{title}</HeaderTitle>
            </HeaderContent>
        </HeaderContainer>
    );
};

export default NewDetailHeader;