import { Text, TextInput } from 'react-native';
import styled from 'styled-components/native';
import { useTranslation } from 'react-i18next';
import { useState, useRef, useEffect } from 'react';

const HeaderContainer = styled.View<{ isSearching: boolean }>`
  flex-direction: row;
  align-items: center;
  padding-top: 40px;
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

const SearchInput = styled.TextInput`
  flex: 1;
  height: 40px;
  border-radius: 8px;
  background-color: #f0f0f0;
  padding-horizontal: 10px;
  margin-left: 10px;
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

const BackButton = styled.TouchableOpacity<{ isPressed: boolean }>`
  width: 40px;
  height: 40px;
  background-color: ${props => props.isPressed ? 'rgb(216, 216, 216)' : 'rgb(255, 255, 255)'};
  transition: background-color 1.2s ease;
  border-radius: 50%;
  margin-left: auto;
  justify-content: center;
  align-items: center;
`;

const BackButtonImage = styled.Image`
  position: absolute;
  top: 10;
  left: 9;
  right: 0;
  bottom: 0;
  width: 20px;
  height: 20px;
`;

const SearchResultContainer = styled.ScrollView`
    height: 100%;
    width: 100%;
    background-color: #ffffff;
`;

export default function Header() {
    const { t } = useTranslation();
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [searchText, setSearchText] = useState('');
    const searchInputRef = useRef<TextInput>(null);
    const [isSearchPressed, setIsSearchButtonPressed] = useState(false);
    const [isBackPressed, setIsBackButtonPressed] = useState(false);

    const handleSearchPressIn = () => {
        setIsSearchButtonPressed(true);
    };
    const handleSearchPressOut = () => {
        setIsSearchButtonPressed(false);
    };

    const handleBackPressIn = () => {
        setIsBackButtonPressed(true);
    };
    const handleBackPressOut = () => {
        setIsBackButtonPressed(false);
    };

    // Фокус на input при входе в режим поиска
    useEffect(() => {
        if (isSearchMode && searchInputRef.current) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    }, [isSearchMode]);

    const handleSearchPress = () => {
        setIsSearchMode(true);
    };

    const handleBackPress = () => {
        setIsSearchMode(false);
        setSearchText('');
        if (searchInputRef.current) {
            searchInputRef.current.blur();
        }
    };

    const handleSearchSubmit = () => {
        // Здесь можно добавить логику поиска
        console.log('Searching for:', searchText);
    };

    if (isSearchMode) {
        return (
            <>
            <HeaderContainer isSearching={true}>
                <BackButton onPress={handleBackPress} isPressed={isBackPressed} activeOpacity={1} onPressIn={handleBackPressIn} onPressOut={handleBackPressOut}>
                    <BackButtonImage
                        source={require('../assets/back.png')} 
                        style={{ width: 20, height: 20, tintColor: 'black' }}
                    />
                </BackButton>
                <SearchInput
                    ref={searchInputRef}
                    placeholder={t('search')}
                    value={searchText}
                    onChangeText={setSearchText}
                    onSubmitEditing={handleSearchSubmit}
                    returnKeyType="search"
                    autoCapitalize="none"
                    autoCorrect={false}
                />
            </HeaderContainer>
            <SearchResultContainer>

            </SearchResultContainer>
            </>
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