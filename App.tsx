import { StatusBar, StyleSheet, useColorScheme, View, Text, Button, Image } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import Header from './components/Header';
import { useState } from 'react';



import BadgeList from './components/BadgeList';
import NewsList from './components/NewsList';
import NewDetailHeader from './components/NewDetailHeader';
import ParallaxHeader from './components/ParallaxHeader';
import styled from 'styled-components/native';

const Stack = createNativeStackNavigator<RootStackParamList>();

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
type DetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'Details'>;

const ContentContainer = styled.View`
  padding: 20px;
  width: 100%;
  height: 100%;
`;

const ContentText = styled.Text`
  font-size: 16px;
  line-height: 24px;
  color: #000000;
`;

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
    </>
  );
}



const DetailsScreen = ({ route }: DetailsScreenProps) => {
  const { title, image, description, content } = route.params;

  return (
    <ParallaxHeader image={image} title={title} description={description}>
      <ContentContainer>
        <ContentText>{content}</ContentText>
        {/* Добавьте здесь остальной контент новости */}
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
              statusBarStyle: 'light-content',
              statusBarTranslucent: true,
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
