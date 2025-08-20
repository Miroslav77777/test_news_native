import styled from 'styled-components/native';
import { CardContainer, CardTextContainer, CardTitleContainer, CardDateSourceContainer, CardImage } from '../styles/CardStyles';
import React, { useState, useEffect, useRef } from 'react';
import { TouchableOpacity, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

const Title = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #000000;
  text-align: left;
  width: 80%;
`;

const DateSource = styled.Text`
  font-size: 8px;
  color: #000000;
`;

const SkeletonImage = styled(Animated.View)`
  position: absolute;
  left: -1;
  top: -1;
  width: 150px;
  height: 150px;
  border-radius: 10px;
  background-color: #f0f0f0;
  padding: 1px;
`;

const FallbackImage = styled.View`
  position: absolute;
  left: -1;
  top: -1;
  width: 150px;
  height: 150px;
  background-color: #e0e0e0;
  border-radius: 10px;
`;

interface NewCardProps {
  image?: string;
  title: string;
  date: string;
  source: string;
  url?: string;
  description?: string;
  content?: string | null;
}

const NewCard: React.FC<NewCardProps> = ({ image, title, date, source, url, description, content }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [_imageTimeout, setImageTimeout] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();


  
  // Анимационное значение для скелетона
  const imageOpacity = useRef(new Animated.Value(0.3)).current;

  // Функция для создания анимации переливания
  const createShimmerAnimation = (animatedValue: Animated.Value) => {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: false,
        }),
      ]),
      { iterations: -1 }
    );
  };

  // Запуск анимации скелетона
  useEffect(() => {
    if (imageLoading && !imageError) {
      const animation = createShimmerAnimation(imageOpacity);
      animation.start();
      
      return () => {
        animation.stop();
      };
    }
  }, [imageLoading, imageError, imageOpacity]);

  useEffect(() => {
    if (image && !imageError) {
      // Таймаут на загрузку изображения
      timeoutRef.current = setTimeout(() => {
        console.log('⏰ Image loading timeout for:', title);
        setImageTimeout(true);
        setImageLoading(false);
      }, 10000); // 10 секунд
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [image, imageError, title]);

  // Добавьте логирование для отладки
  const handleImageLoad = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // console.log('✅ Image loaded successfully:', {
    //   title,
    //   imageUrl: image,
    //   timestamp: new Date().toISOString()
    // });
    setImageLoading(false);
    setImageTimeout(false);
  };

  const handleImageError = (error: any) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // console.log('❌ Image loading error:', {
    //   title,
    //   imageUrl: image,
    //   error: error?.nativeEvent?.error || 'Unknown error',
    //   timestamp: new Date().toISOString()
    // });
    setImageLoading(false);
    setImageError(true);
    setImageTimeout(false);
  };

  const handlePress = () => {
    if (title && url) {
      navigation.navigate('Details', {
        title: title,
        image: image || '',
        description: description || '',
        url: url,
        content: content || '',
        date: date,
        source: source
      });
    }
  };

  // Функция для обрезки заголовка до 45 символов
  const truncateTitle = (text: string, maxLength: number = 45) => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  };

  // Интерполируем цвета для анимации
  const imageBackgroundColor = imageOpacity.interpolate({
    inputRange: [0.3, 1],
    outputRange: ['rgb(240, 240, 240)', 'rgb(200, 200, 200)']
  });

  // Проверяем валидность URL изображения
  const isValidImageUrl = image && 
    (image.startsWith('http://') || image.startsWith('https://')) && 
    image.trim().length > 0;

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <CardContainer>
      {imageLoading && isValidImageUrl && (
          <SkeletonImage style={{ backgroundColor: imageBackgroundColor }} />
        )}
        {isValidImageUrl && !imageError ? (
          <CardImage 
            source={{ uri: image }} 
            onLoad={handleImageLoad}
            onError={handleImageError}
            // Добавляем дополнительные пропсы для лучшей загрузки
            loadingIndicatorSource={require('../assets/logo.png')}
            progressiveRenderingEnabled={true}
            fadeDuration={300}
          />
        ) : <FallbackImage />}

        <CardTextContainer>
          <CardTitleContainer>
            <Title>{truncateTitle(title)}</Title>
          </CardTitleContainer>
          <CardDateSourceContainer>
            <DateSource>{truncateTitle(source, 20)}</DateSource>
            <DateSource>{date}</DateSource>
          </CardDateSourceContainer>
        </CardTextContainer>
      </CardContainer>
    </TouchableOpacity>
  );
};

export default NewCard;