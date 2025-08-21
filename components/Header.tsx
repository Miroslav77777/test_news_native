import styled from 'styled-components/native';
import { useTranslation } from 'react-i18next';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { SearchInput } from './SearchInput';

const HeaderContainer = styled.View<{ isSearching: boolean }>`
  flex-direction: row;
  align-items: center;
  padding-top: 25px;
  padding-horizontal: 10px;
  padding-bottom: 10px;
  background-color: #ffffff;
  border-bottom-width: ${props => props.isSearching ? '0px' : '1px'};
  border-bottom-color: #ddd;
`;

const Logo = styled.Image`
  width: 100px;
  height: 30px;
  resize-mode: contain;
`;



const SearchButton = styled.TouchableOpacity<{ isPressed: boolean }>`
  width: 40px;
  height: 40px;
  background-color: ${props => props.isPressed ? 'rgb(216, 216, 216)' : 'rgb(255, 255, 255)'};
  transition: background-color 1.2s ease;
  border-radius: 50%;
  margin-left: auto;
  justify-content: center;
  align-items: center;
`;

const SearchButtonImage = styled.Image`
    position: absolute;
    top: 10;
    left: 10;
    right: 0;
    bottom: 0;
    width: 20px;
    height: 20px;
`;



export default function Header() {
    const { t } = useTranslation();
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [isSearchPressed, setIsSearchButtonPressed] = useState(false);

    // Сбрасываем состояния хедера при получении фокуса (возврате на HomeScreen)
    useFocusEffect(
        useCallback(() => {
            setIsSearchMode(false);
            setIsSearchButtonPressed(false);
        }, [])
    );

    const handleSearchPressIn = () => {
        setIsSearchButtonPressed(true);
    };
    
    const handleSearchPressOut = () => {
        setIsSearchButtonPressed(false);
    };

    const handleSearchPress = () => {
        setIsSearchMode(true);
    };

    const handleBackPress = () => {
        setIsSearchMode(false);
    };



    if (isSearchMode) {
        return (
            <SearchInput
                onBackPress={handleBackPress}
                placeholder={t('search')}
                autoFocus={true}
            />
        );
    }

    return (
        <HeaderContainer isSearching={false}>
            <Logo source={require('../assets/logo.png')} />
            <SearchButton 
                onPress={handleSearchPress}
                onPressIn={handleSearchPressIn}
                onPressOut={handleSearchPressOut}
                isPressed={isSearchPressed}
                activeOpacity={1}
            >
                <SearchButtonImage
                    source={require('../assets/search.png')} 
                    style={{ width: 20, height: 20, tintColor: 'black' }}
                />
            </SearchButton>
        </HeaderContainer>
    );
}