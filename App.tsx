import { StatusBar, StyleSheet, useColorScheme, View, Linking } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import Header from './components/Header';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';


import BadgeList from './components/BadgeList';
import NewsList from './components/NewsList';
import ParallaxHeader from './components/ParallaxHeader';
import styled from 'styled-components/native';
import { SearchInput } from './components/SearchInput';
import { NewsItem } from './components/NewsList';

const Stack = createNativeStackNavigator<RootStackParamList>();

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
type DetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'Details'>;
type SearchResultsScreenProps = NativeStackScreenProps<RootStackParamList, 'SearchResults'>;

const ContentContainer = styled.View`
  padding: 20px;
  width: 100%;
  height: 100%;
`;

const ContentText = styled.Text`
  font-size: 16px;
  line-height: 24px;
  color: #000000;
  margin-bottom: 20px;
`;

const ReadMoreButton = styled.TouchableOpacity`
  background-color: #007AFF;
  padding: 12px 24px;
  border-radius: 8px;
  align-self: flex-start;
  margin-top: 10px;
`;

const ReadMoreText = styled.Text`
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
`;



function HomeScreen({ }: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    console.log('Selected category:', category);
  };

  return (
    <>
    <BadgeList 
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
      />
    <View style={[styles.container, { paddingTop: insets.top }]}>
    <NewsList category={selectedCategory} />
    </View>
    </>
  );
}

const SearchResultsScreen = ({ route, navigation }: SearchResultsScreenProps) => {
  const { searchQuery, queryType, news } = route.params;
  
  console.log('🔍 SearchResultsScreen открыт с параметрами:', { searchQuery, queryType, newsCount: news?.length });
  
  const handleBackPress = () => {
    console.log('🔍 Нажата кнопка назад, возвращаюсь на предыдущий экран');
    navigation.goBack();
  };

  const handleNewSearch = (newSearchQuery: string, newQueryType: string, newNews: NewsItem[]) => {
    console.log('🔍 Новый поиск:', { newSearchQuery, newQueryType, newNewsCount: newNews?.length });
    
    // Логируем текущий маршрут
    console.log('🔍 Текущий маршрут: SearchResults с параметрами:', { searchQuery, queryType, newsCount: news?.length });
    
    // Навигация на новый экран с новыми параметрами, сохраняя историю
    navigation.push('SearchResults', {
      searchQuery: newSearchQuery,
      queryType: newQueryType,
      news: newNews
    });
  };
  
  return (
    <>
    <SearchInput 
        onBackPress={handleBackPress}
        autoFocus={false}
        initialValue={queryType === 'manual' ? searchQuery : news[0].title}
        doubling={true}
        onNewSearch={handleNewSearch}
      />
      <NewsList category='all' queryType={queryType} searchQuery={searchQuery} queryNews={news} />
    </>
  );
};



const DetailsScreen = ({ route }: DetailsScreenProps) => {
  const { title, image, description, content, url, date, source } = route.params;
  const { t } = useTranslation();

  const handleReadMore = async () => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log(`Can't open URL: ${url}`);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
    } finally {
      console.log('Trying to open URL, hoping for luck');
      await Linking.openURL(url);
    }
  };

  return (
    <ParallaxHeader image={image} title={title} description={description} date={date} source={source}>
      <ContentContainer>
        <ContentText>{content}</ContentText>
        <ReadMoreButton onPress={handleReadMore}>
          <ReadMoreText>{t('readMore')}</ReadMoreText>
        </ReadMoreButton>
      </ContentContainer>
    </ParallaxHeader>
  );
};



function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} options={{ header: () => <Header /> }} />
          <Stack.Screen
            name="Details"
            component={DetailsScreen}
            options={{
              headerShown: false, // Скрываем стандартный хедер
              statusBarStyle: 'light',
              statusBarTranslucent: true,
            }}
          />
          <Stack.Screen
            name="SearchResults"
            component={SearchResultsScreen}
            options={{
              headerShown: false,
              unmountOnBlur: true,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default App;
