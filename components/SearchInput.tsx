import React, { useState, useCallback, useRef, useEffect } from 'react';
import { TextInput, FlatList } from 'react-native';
import styled from 'styled-components/native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { searchNews } from '../utils/api';
import { RootStackParamList } from '../types';
import { NewsItem } from './NewsList';
import { useIsFocused } from "@react-navigation/native";

interface SearchInputProps {
    onBackPress: () => void;
    placeholder?: string;
    autoFocus?: boolean;
    initialValue?: string;
    doubling?: boolean;
    onNewSearch?: (searchQuery: string, queryType: string, news: NewsItem[]) => void;
}

const SearchContainer = styled.View`
    flex-direction: row;
    align-items: center;
    padding: 10px;
    background-color: white;
    border-bottom-width: 1px;
    border-bottom-color: #e0e0e0;
`;

const SearchInputWrapper = styled.View`
    flex: 1;
    position: relative;
    height: 40px;
    border-radius: 8px;
    background-color: #f0f0f0;
`;

const BackButton = styled.TouchableOpacity<{ isPressed: boolean }>`
    padding: 8px;
    border-radius: 8px;
    background-color: ${props => props.isPressed ? '#f0f0f0' : 'transparent'};
`;

const BackButtonImage = styled.Image`
    width: 20px;
    height: 20px;
    tint-color: black;
`;

const SearchInputField = styled(TextInput)`
    flex: 1;
    height: 40px;
    border-radius: 8px;
    background-color: #f0f0f0;
    font-size: 16px;
    padding-horizontal: 10px;
    overflow: hidden;
    width: 90%;
`;

const SearchResultContainer = styled.View`
    height: 400px;
    background-color: white;
    border-bottom-width: 1px;
    border-bottom-color: #e0e0e0;
`;

const AutocompleteItem = styled.TouchableOpacity`
    padding: 15px;
    border-bottom-width: 1px;
    border-bottom-color: #f0f0f0;
`;

const AutocompleteTitle = styled.Text`
    font-size: 16px;
    color: #333;
`;

const LoadingText = styled.Text`
    padding: 20px;
    text-align: center;
    font-size: 16px;
    color: #666;
`;

const NoResultsText = styled.Text`
    padding: 20px;
    text-align: center;
    font-size: 16px;
    color: #666;
`;

const ClearButton = styled.TouchableOpacity`
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-10px);
    width: 20px;
    height: 20px;
    justify-content: center;
    align-items: center;
    z-index: 1;
`;

const ClearButtonImage = styled.Image`
    width: 16px;
    height: 16px;
    tint-color: #666;
`;

export const SearchInput: React.FC<SearchInputProps> = ({
    onBackPress,
    placeholder,
    autoFocus = false,
    initialValue,
    doubling = false,
    onNewSearch
}) => {
    const { t } = useTranslation();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [searchText, setSearchText] = useState(initialValue || '');
    const [searchResults, setSearchResults] = useState<NewsItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [debounceTimeout, setDebounceTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
    const [isBackPressed, setIsBackPressed] = useState(false);
    const [isKeyboardFocused, setIsKeyboardFocused] = useState(false);
    const isFocused = useIsFocused();
    console.log('🔍 initialValue:', searchText, initialValue);
    
    const searchInputRef = useRef<TextInput>(null);

    const performSearch = useCallback(async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setIsLoading(true);
        try {
            const response = await searchNews(query, 1, 'input');
            setSearchResults(response.articles || []);
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if(initialValue) {
            performSearch(initialValue);
        }
    }, [initialValue, performSearch]);

    useEffect(() => {
        if (!isFocused) {
            setSearchText('');
        }else {
            setSearchText(initialValue || '');
            performSearch(initialValue || '');
        }
    }, [isFocused, initialValue, performSearch]);

    const handleSearchChange = (text: string) => {
        setSearchText(text);
        
        // Очищаем предыдущий таймаут
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }
        
        // Устанавливаем новый таймаут для дебаунса
        const timeout = setTimeout(() => {
            performSearch(text);
        }, 500);
        
        setDebounceTimeout(timeout);
    };

    const handleSearchSubmit = (items: NewsItem[]) => {
        if (searchText.trim()) {
            if (onNewSearch) {
                // Если onNewSearch передан, используем его
                onNewSearch(searchText.trim(), 'manual', items);
            } else {
                console.log('🔄⭐️⭐️⭐️⭐️⭐️ handleSearchSubmit manual:', { searchText: searchText.trim(), items });
                // Иначе используем обычную навигацию
                navigation.navigate('SearchResults', {
                    searchQuery: searchText.trim(),
                    queryType: 'manual',
                    news: items
                });
            }
        }
    };

    const handleResultPress = (item: NewsItem[]) => {
        if (onNewSearch) {
            // Если onNewSearch передан, используем его
            onNewSearch(searchText.trim(), 'auto', item);
        } else {
            // Иначе используем обычную навигацию
            navigation.navigate('SearchResults', {
                searchQuery: searchText.trim(),
                queryType: 'auto',
                news: item
            });
        }
        
        // Убираем фокус после обработки результата с небольшой задержкой
        setTimeout(() => {
            searchInputRef.current?.blur();
        }, 50);
    };

    const handleClearText = () => {
        setSearchText('');
        setSearchResults([]);
        searchInputRef.current?.focus();
    };

    const handleInputFocus = () => {
        setIsKeyboardFocused(true);
        // Перемещаем каретку в конец текста
        setTimeout(() => {
            if (searchInputRef.current && searchText.length > 0) {
                searchInputRef.current.setNativeProps({
                    selection: { start: searchText.length, end: searchText.length }
                });
            }
        }, 50);
    };

    const handleInputBlur = () => {
        // Добавляем небольшую задержку, чтобы успеть обработать нажатие на автокомплит
        setTimeout(() => {
            setIsKeyboardFocused(false);
        }, 100);
    };

    const handleBackPressIn = () => setIsBackPressed(true);
    const handleBackPressOut = () => setIsBackPressed(false);

    const handleBackButtonPress = () => {
        if (isKeyboardFocused) {
            // Если клавиатура в фокусе, убираем фокус
            searchInputRef.current?.blur();
            
            // При doubling true НЕ выполняем onBackPress, только убираем фокус
            if (!doubling) {
                // Если doubling false, выполняем onBackPress сразу
                onBackPress();
            }
        } else {
            // Если клавиатура не в фокусе, выполняем onBackPress
            onBackPress();
        }
    };

    // Очищаем таймаут при размонтировании компонента
    useEffect(() => {
        return () => {
            if (debounceTimeout) {
                clearTimeout(debounceTimeout);
            }
        };
    }, [debounceTimeout]);

    return (
        <>
            <SearchContainer>
                <BackButton 
                    onPress={handleBackButtonPress} 
                    isPressed={isBackPressed} 
                    activeOpacity={1} 
                    onPressIn={handleBackPressIn} 
                    onPressOut={handleBackPressOut}
                >
                    <BackButtonImage
                        source={require('../assets/back.png')}
                    />
                </BackButton>
                <SearchInputWrapper>
                    <SearchInputField
                        ref={searchInputRef}
                        placeholder={placeholder || t('search')}
                        value={searchText}
                        onChangeText={handleSearchChange}
                        onSubmitEditing={() => handleSearchSubmit(searchResults)}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        returnKeyType="search"
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoFocus={autoFocus}
                    />
                    {searchText.length > 0 && (
                        <ClearButton onPress={handleClearText}>
                            <ClearButtonImage source={require('../assets/cross.png')} />
                        </ClearButton>
                    )}
                </SearchInputWrapper>
            </SearchContainer>
            {isKeyboardFocused && (
                <SearchResultContainer>
                    {isLoading ? (
                        <LoadingText>Поиск...</LoadingText>
                    ) : searchResults.length > 0 ? (
                        <FlatList
                            data={searchResults}
                            keyExtractor={(item, index) => `${item.title}-${index}`}
                            renderItem={({ item }) => (
                                <AutocompleteItem onPress={() => handleResultPress([item])}>
                                    <AutocompleteTitle>{item.title}</AutocompleteTitle>
                                </AutocompleteItem>
                            )}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        />
                    ) : searchText.trim() ? (
                        <NoResultsText>Ничего не найдено</NoResultsText>
                    ) : null}
                </SearchResultContainer>
            )}
        </>
    );
};
