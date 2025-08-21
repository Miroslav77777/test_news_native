import React, { useRef, useState } from 'react';
import { Animated, Dimensions, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';

const { height: screenHeight } = Dimensions.get('window');
const HEADER_HEIGHT = 350;
const HEADER_MIN_HEIGHT = 100;
const TITLE_TRANSITION_HEIGHT = 200;

interface ParallaxHeaderProps {
  image?: string;
  title: string;
  description?: string;
  date?: string;
  source?: string;
  children: React.ReactNode;
}

const Container = styled.View`
  flex: 1;
  background-color: transparent;
`;

const HeaderContainer = styled(Animated.View)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: ${HEADER_HEIGHT}px;
  z-index: 10;
  overflow: hidden;
`;

const HeaderImage = styled(FastImage)`
  width: 100%;
  height: 100%;
  position: absolute;
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
  bottom: 20px;
  left: 20px;
  right: 20px;
`;

const HeaderTitle = styled(Animated.Text)`
  color: #ffffff;
  font-size: 24px;
  font-weight: bold;
  line-height: 32px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;

const HeaderDescription = styled(Animated.Text)`
  color:rgba(255, 255, 255, 0.8);
  font-size: 16px;
  line-height: 24px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  height: 50px;
`;

const HeaderDateSourceContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const HeaderDate = styled(Animated.Text)`
  color:rgba(255, 255, 255, 0.8);
  font-size: 12px;
  line-height: 24px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  height: 20px;
`;

const HeaderSource = styled(Animated.Text)`
  color:rgba(255, 255, 255, 0.8);
  font-size: 12px;
  line-height: 24px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  height: 20px;
`;

const BackButton = styled.TouchableOpacity`
  position: absolute;
  top: 50px;
  left: 20px;
  background-color: rgba(0, 0, 0, 0.3);
  padding: 10px 15px;
  border-radius: 20px;
  z-index: 20;
`;

const BackImage = styled.Image`
  width: 20px;
  height: 20px;
  tint-color: #ffffff;
`;

const StickyHeader = styled(Animated.View)`
  position: relative;
  height: ${HEADER_MIN_HEIGHT}px;
  justify-content: center;
  padding-left: 20px;
  margin-top: ${HEADER_HEIGHT + 60}px;
  width: 90%;
`;

const StickyTitle = styled(Animated.Text)`
  color:rgb(0, 0, 0);
  font-size: 20px;
  font-weight: bold;
`;

const StickyDescription = styled(Animated.Text)`
  color:rgba(0, 0, 0, 0.8);
  font-size: 12px;
  width: 80%;
`;

const StickyDateSourceContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const StickyDate = styled(Animated.Text)`
  color:rgba(0, 0, 0, 0.8);
  font-size: 12px;
  line-height: 24px;
  height: 20px;
`;

const StickySource = styled(Animated.Text)`
  color:rgba(0, 0, 0, 0.8);
  font-size: 12px;
  line-height: 24px;
  height: 20px;
`;


const ContentContainer = styled(Animated.View)`
  background-color: #ffffff;
  min-height: ${screenHeight/1.5}px;
`;

const ParallaxHeader: React.FC<ParallaxHeaderProps> = ({ image, title, description, date, source, children}) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  // Хедер полностью исчезает при скролле
  const headerHeight = scrollY.interpolate({
    inputRange: [0, TITLE_TRANSITION_HEIGHT],
    outputRange: [HEADER_HEIGHT, 0],
    extrapolate: 'clamp',
  });

  // Картинка полностью исчезает
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, TITLE_TRANSITION_HEIGHT],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Заголовок в хедере исчезает
  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [0, TITLE_TRANSITION_HEIGHT],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const headerTitleTranslateY = scrollY.interpolate({
    inputRange: [0, TITLE_TRANSITION_HEIGHT],
    outputRange: [0, -20],
    extrapolate: 'clamp',
  });

  // Sticky заголовок появляется
  const stickyTitleOpacity = scrollY.interpolate({
    inputRange: [0, TITLE_TRANSITION_HEIGHT],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const stickyTitleTranslateY = scrollY.interpolate({
    inputRange: [0, TITLE_TRANSITION_HEIGHT],
    outputRange: [20, 0],
    extrapolate: 'clamp',
  });

  const descriptionTranslateY = scrollY.interpolate({
    inputRange: [0, TITLE_TRANSITION_HEIGHT],
    outputRange: [-160, 50],
    extrapolate: 'clamp',
  });

  // Кнопка назад также исчезает при скролле
  const backButtonOpacity = scrollY.interpolate({
    inputRange: [0, TITLE_TRANSITION_HEIGHT],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <Container>
      {/* Основной хедер с параллаксом - полностью исчезает */}
      <HeaderContainer style={{ height: headerHeight, opacity: headerOpacity }}>
        {image && (
          <HeaderImage
            source={{ uri: image }}
            resizeMode={FastImage.resizeMode.cover}
          />
        )}
        <HeaderOverlay />
        
        <HeaderContent>
          <HeaderTitle
            style={{
              opacity: headerTitleOpacity,
              transform: [{ translateY: headerTitleTranslateY }],
            }}
          >
            {title}
          </HeaderTitle>
          <HeaderDescription
            style={{
              opacity: headerTitleOpacity,
              transform: [{ translateY: headerTitleTranslateY }],
            }}
          >
            {description}
          </HeaderDescription>
          <HeaderDateSourceContainer>
            <HeaderDate>{date}</HeaderDate>
            <HeaderSource>{source}</HeaderSource>
          </HeaderDateSourceContainer>
        </HeaderContent>
      </HeaderContainer>

      {/* Кнопка назад - исчезает при скролле */}
      <BackButton 
        onPress={handleBack}
        style={{ opacity: backButtonOpacity }}
      >
        <BackImage source={require('../assets/back.png')} />
      </BackButton>

      {/* Контент с ScrollView */}
      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Sticky хедер теперь внутри ScrollView */}
        <StickyHeader>
          <StickyTitle
            style={{
              opacity: stickyTitleOpacity,
              transform: [{ translateY: stickyTitleTranslateY }],
            }}
          >
            {title}
          </StickyTitle>
          <StickyDescription
            style={{
              opacity: stickyTitleOpacity,
              transform: [{ translateY: stickyTitleTranslateY }],
            }}
          >
            {description}
          </StickyDescription>
          <StickyDateSourceContainer>
            <StickyDate>{date}</StickyDate>
            <StickySource>{source}</StickySource>
          </StickyDateSourceContainer>
        </StickyHeader>

        {/* Основной контент */}
        <ContentContainer style={{ transform: [{ translateY: descriptionTranslateY }] }}>
          {children}
        </ContentContainer>
      </Animated.ScrollView>
    </Container>
  );
};

export default ParallaxHeader; 