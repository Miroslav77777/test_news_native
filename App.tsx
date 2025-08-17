import { StatusBar, StyleSheet, useColorScheme, View, Text, Button } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import Header from './components/Header';
import { useState } from 'react';

import { getNews } from './utils/api';

import SkeletonList from './components/SkeletonList';
import BadgeList from './components/BadgeList';
import NewsList from './components/NewsList';

const Stack = createNativeStackNavigator<RootStackParamList>();

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
type DetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'Details'>;

function HomeScreen({ navigation }: HomeScreenProps) {
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
    <Button title="Перейти на экран деталей" onPress={() => navigation.navigate('Details', {userId: 69})} />
    </>
  );
}

function DetailsScreen({ route }: DetailsScreenProps) {
  const { userId } = route.params;
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Привет!</Text>
      <Text>Это кастомный экран без шаблона.</Text>
      <Text>Заебись юзер айди: {userId}</Text>
    </View>
  );
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} options={{ header: () => <Header /> }} />
          <Stack.Screen name="Details" component={DetailsScreen} options={{ title: 'Детали' }} />
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
