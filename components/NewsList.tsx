import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, RefreshControl, ActivityIndicator, View, Text } from 'react-native';
import styled from 'styled-components/native';
import { getNews } from '../utils/api';
import NewCard from './NewCard';
import SkeletonList from './SkeletonList';

const Container = styled.View`
  flex: 1;
  width: 100%;
`;

const LoadingContainer = styled.View`
  padding: 20px;
  align-items: center;
`;

const ErrorContainer = styled.View`
  padding: 20px;
  align-items: center;
`;

const ErrorText = styled.Text`
  color: #d32f2f;
  font-size: 16px;
  text-align: center;
`;

const EmptyContainer = styled.View`
  padding: 40px 20px;
  align-items: center;
`;

const EmptyText = styled.Text`
  color: #666;
  font-size: 16px;
  text-align: center;
`;

interface NewsItem {
  title: string;
  publishedAt: string;
  source: { name: string };
  urlToImage: string;
  description: string;
  url: string;
  content: string | null;
}

interface NewsResponse {
  articles: NewsItem[];
  totalResults: number;
  status: string;
}

interface NewsListProps {
  category: string;
}

export default function NewsList({ category }: NewsListProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [useEverything, setUseEverything] = useState(false); // Новое состояние

  const loadNews = useCallback(async (pageNum: number, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        setUseEverything(false);
      } else {
        setIsLoadingMore(true);
      }
      
      setError(null);
      
      console.log('🔄 Loading news:', { 
        page: pageNum, 
        category, 
        isRefresh, 
        useEverything 
      });
      
      const newsResponse: NewsResponse = await getNews(category, pageNum, useEverything);
      const newArticles = newsResponse.articles || [];
      
      console.log('📰 Received news response:', {
        articlesCount: newArticles.length,
        totalResults: newsResponse.totalResults,
        status: newsResponse.status,
        page: pageNum,
        isRefresh,
        endpoint: useEverything ? 'everything' : 'top-headlines'
      });
      
      if (newArticles && newArticles.length > 0) {
        if (isRefresh) {
          setNews(newArticles);
          setPage(1);
          setTotalResults(newsResponse.totalResults);
        } else {
          setNews(prev => [...prev, ...newArticles]);
        }
        
        // Проверяем, нужно ли переключиться на everything
        const currentTotal = isRefresh ? newArticles.length : news.length + newArticles.length;
        const hasMoreFromCurrentEndpoint = currentTotal < newsResponse.totalResults;
        
        if (!hasMoreFromCurrentEndpoint && !useEverything && category === 'all') {
          // Переключаемся на everything для получения большего количества новостей
          console.log('🔄 Switching to everything endpoint for more news');
          setUseEverything(true);
          setHasMore(true);
          setPage(1);
          
          // ВАЖНО: НЕ заменяем новости, а добавляем к существующим
          const everythingResponse = await getNews(category, 1, true);
          const everythingArticles = everythingResponse.articles || [];
          
          if (everythingArticles.length > 0) {
            // Добавляем everything новости к существующим top-headlines
            setNews(prev => [...prev, ...everythingArticles]);
            setTotalResults(everythingResponse.totalResults);
            
            // Проверяем, есть ли еще страницы в everything
            const hasMoreInEverything = everythingArticles.length === 10;
            setHasMore(hasMoreInEverything);
            
            console.log('✅ Switched to everything, added:', everythingArticles.length, 'articles to existing', news.length, 'articles. Total:', news.length + everythingArticles.length, 'hasMore:', hasMoreInEverything);
          } else {
            setHasMore(false);
          }
        } else {
          // Обычная логика пагинации
          setHasMore(hasMoreFromCurrentEndpoint);
          
          console.log('📄 Pagination status:', {
            currentPage: pageNum,
            hasMore: hasMoreFromCurrentEndpoint,
            articlesReceived: newArticles.length,
            currentTotal: currentTotal,
            totalAvailable: newsResponse.totalResults,
            remaining: newsResponse.totalResults - currentTotal,
            endpoint: useEverything ? 'everything' : 'top-headlines'
          });
        }
      } else {
        // Если нет новостей и мы уже используем everything, значит больше нет
        if (useEverything) {
          setHasMore(false);
          console.log('🏁 No more articles available from everything');
        } else {
          // Пробуем переключиться на everything
          console.log('🔄 No more top headlines, trying everything endpoint');
          setUseEverything(true);
          setPage(1);
          
          // Рекурсивно загружаем с everything
          await loadNews(1, false);
        }
      }
    } catch (err: any) {
      console.error('❌ Error loading news:', err);
      setError(err.message || 'Ошибка загрузки новостей');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsLoadingMore(false);
    }
  }, [category, news.length, useEverything]);

  const onRefresh = useCallback(() => {
    console.log('🔄 Refresh triggered');
    setError(null);
    setHasMore(true);
    setTotalResults(0);
    setUseEverything(false); // Сбрасываем к top-headlines
    loadNews(1, true);
  }, [loadNews]);

  const loadMore = useCallback(() => {
    console.log('🔍 LoadMore check:', {
      isLoadingMore,
      hasMore,
      refreshing,
      loading,
      currentTotal: news.length,
      totalAvailable: totalResults,
      endpoint: useEverything ? 'everything' : 'top-headlines',
      page: page
    });
    
    if (!isLoadingMore && hasMore && !refreshing && !loading) {
      const nextPage = page + 1;
      console.log('⬇️ Loading more, next page:', nextPage, 'endpoint:', useEverything ? 'everything' : 'top-headlines');
      setPage(nextPage);
      loadNews(nextPage, false);
    } else {
      console.log('⏸️ Load more blocked:', {
        isLoadingMore,
        hasMore,
        refreshing,
        loading,
        currentTotal: news.length,
        totalAvailable: totalResults,
        endpoint: useEverything ? 'everything' : 'top-headlines'
      });
    }
  }, [isLoadingMore, hasMore, refreshing, loading, page, loadNews, news.length, totalResults, useEverything]);

  useEffect(() => {
    console.log('🔄 Category changed, resetting...');
    setPage(1);
    setNews([]);
    setHasMore(true);
    setError(null);
    setTotalResults(0);
    setUseEverything(false); // Сбрасываем к top-headlines
    loadNews(1, true);
  }, [category]);

  useEffect(() => {
    console.log(' hasMore changed:', hasMore);
  }, [hasMore]);

  useEffect(() => {
    console.log('🔄 useEverything changed:', useEverything);
  }, [useEverything]);

  const renderNewsItem = ({ item }: { item: NewsItem }) => (
    <NewCard
      title={item.title}
      date={new Date(item.publishedAt).toLocaleDateString('ru-RU')}
      source={item.source.name}
      image={item.urlToImage}
      url={item.url}
      description={item.description}
      content={item.content}
    />
  );

  const renderFooter = () => {
    if (!isLoadingMore || !hasMore) return null;
    
    return (
      <LoadingContainer>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={{ marginTop: 10, color: '#666' }}>
          Загрузка... ({news.length} из {totalResults})
        </Text>
        <Text style={{ marginTop: 5, color: '#999', fontSize: 12 }}>
          {useEverything ? '🔍 Поиск по всем новостям' : '📰 Топ-новости'}
        </Text>
      </LoadingContainer>
    );
  };

  const renderEmpty = () => {
    if (loading || refreshing) return <SkeletonList />;
    
    return (
      <EmptyContainer>
        <EmptyText>
          {error ? 'Произошла ошибка при загрузке новостей' : 'Новости не найдены'}
        </EmptyText>
        {totalResults > 0 && (
          <Text style={{ marginTop: 10, color: '#666' }}>
            Всего доступно: {totalResults} новостей
          </Text>
        )}
      </EmptyContainer>
    );
  };

  const renderHeader = () => {
    if (!useEverything) return null;
    
    return (
      <View style={{ 
        backgroundColor: '#e3f2fd', 
        padding: 10, 
        margin: 10, 
        borderRadius: 8,
        alignItems: 'center'
      }}>
        <Text style={{ color: '#1976d2', fontSize: 12, fontWeight: 'bold' }}>
          🔍 Переключились на поиск по всем новостям
        </Text>
        <Text style={{ color: '#666', fontSize: 10, marginTop: 2 }}>
          Загружено {news.length} новостей
        </Text>
      </View>
    );
  };

  if (error && news.length === 0) {
    return (
      <Container>
        <ErrorContainer>
          <ErrorText>{error}</ErrorText>
          <Text 
            style={{ 
              color: '#1976d2', 
              marginTop: 10, 
              textDecorationLine: 'underline' 
            }}
            onPress={onRefresh}
          >
            Попробовать снова
          </Text>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      <FlatList
        data={news}
        renderItem={renderNewsItem}
        keyExtractor={(item, index) => `${item.title}-${index}`}
        onEndReached={loadMore}
        onEndReachedThreshold={0.2}
        refreshControl={
          loading ? null : <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#1976d2']}
          tintColor="#1976d2"
        />
        }
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 10 }}
        removeClippedSubviews={false}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
    </Container>
  );
} 