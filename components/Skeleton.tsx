import { Animated } from 'react-native';
import styled from 'styled-components/native';
import { useEffect, useRef } from 'react';

import { CardContainer, CardTextContainer, CardTitleContainer, CardDateSourceContainer } from '../styles/CardStyles';

const SkeletonImage = styled(Animated.View)`
    position: absolute;
    border-radius: 10px;
    left: -1;
    top: -1;
    width: 150px;
    height: 150px;
    background-color: #f0f0f0;
    padding: 1px;
`;

const SkeletonText = styled(Animated.View)`
    width: 30%;
    height: 12px;
    border-radius: 6px;
`;

const SkeletonTitle = styled(Animated.View)`
    width: 80%;
    height: 16px;
    border-radius: 8px;
    margin-bottom: 8px;
`;

export default function Skeleton() {
    // Создаем анимационные значения для каждого элемента
    const imageOpacity = useRef(new Animated.Value(0.3)).current;
    const titleOpacity = useRef(new Animated.Value(0.3)).current;
    const text1Opacity = useRef(new Animated.Value(0.3)).current;
    const text2Opacity = useRef(new Animated.Value(0.3)).current;
    const text3Opacity = useRef(new Animated.Value(0.3)).current;
    const text4Opacity = useRef(new Animated.Value(0.3)).current;

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

    useEffect(() => {
        // Запускаем анимации
        const animations = [
            createShimmerAnimation(imageOpacity),
            createShimmerAnimation(titleOpacity),
            createShimmerAnimation(text1Opacity),
            createShimmerAnimation(text2Opacity),
            createShimmerAnimation(text3Opacity),
            createShimmerAnimation(text4Opacity),
        ];

        // Запускаем все анимации
        animations.forEach(animation => animation.start());

        // Очистка при размонтировании
        return () => {
            animations.forEach(animation => animation.stop());
        };
    }, [imageOpacity, titleOpacity, text1Opacity, text2Opacity, text3Opacity, text4Opacity]);

    // Интерполируем цвета от белого к серому
    const imageBackgroundColor = imageOpacity.interpolate({
        inputRange: [0.3, 1],
        outputRange: ['rgb(240, 240, 240)', 'rgb(200, 200, 200)']
    });

    const titleBackgroundColor = titleOpacity.interpolate({
        inputRange: [0.3, 1],
        outputRange: ['rgb(240, 240, 240)', 'rgb(200, 200, 200)']
    });

    const textBackgroundColor = text1Opacity.interpolate({
        inputRange: [0.3, 1],
        outputRange: ['rgb(240, 240, 240)', 'rgb(200, 200, 200)']
    });

    return (
        <CardContainer>
            <SkeletonImage style={{ backgroundColor: imageBackgroundColor }} />
            <CardTextContainer>
                <CardTitleContainer>
                    <SkeletonTitle style={{ backgroundColor: titleBackgroundColor }} />
                    <SkeletonTitle style={{ backgroundColor: titleBackgroundColor }} />
                </CardTitleContainer>
                <CardDateSourceContainer>
                    <SkeletonText style={{ backgroundColor: textBackgroundColor }} />
                    <SkeletonText style={{ backgroundColor: textBackgroundColor }} />
                </CardDateSourceContainer>
            </CardTextContainer>
        </CardContainer>
    );
}