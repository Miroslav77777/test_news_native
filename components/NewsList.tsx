import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, RefreshControl, ActivityIndicator, View, Text } from 'react-native';
import styled from 'styled-components/native';
import { getNews } from '../utils/api';
import NewCard from './NewCard';

const Container = styled.View`
  flex: 1;
  background-color: #f5f5f5;
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

  const loadNews = useCallback(async (pageNum: number, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setIsLoadingMore(true);
      }
      
      setError(null);
      
      console.log('🔄 Loading news:', { page: pageNum, category, isRefresh });
      
      const newsResponse: NewsResponse = await getNews(category, pageNum);
      const newArticles = newsResponse.articles || [];
      
      console.log('📰 Received news response:', {
        articlesCount: newArticles.length,
        totalResults: newsResponse.totalResults,
        status: newsResponse.status,
        page: pageNum,
        isRefresh
      });
      
      if (newArticles && newArticles.length > 0) {
        if (isRefresh) {
          setNews(newArticles);
          setPage(1);
          setTotalResults(newsResponse.totalResults);
        } else {
          setNews(prev => [...prev, ...newArticles]);
        }
        
        // Точная логика с использованием totalResults
        const currentTotal = isRefresh ? newArticles.length : news.length + newArticles.length;
        const hasMorePages = currentTotal < newsResponse.totalResults;
        
        setHasMore(hasMorePages);
        
        console.log(' Precise pagination status:', {
          currentPage: pageNum,
          hasMore: hasMorePages,
          articlesReceived: newArticles.length,
          currentTotal: currentTotal,
          totalAvailable: newsResponse.totalResults,
          remaining: newsResponse.totalResults - currentTotal
        });
      } else {
        setHasMore(false);
        console.log('🏁 No more articles available');
      }
    } catch (err: any) {
      console.error('❌ Error loading news:', err);
      setError(err.message || 'Ошибка загрузки новостей');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsLoadingMore(false);
    }
  }, [category, news.length]);

  const onRefresh = useCallback(() => {
    console.log('🔄 Refresh triggered');
    setError(null);
    setHasMore(true);
    setTotalResults(0);
    loadNews(1, true);
  }, [loadNews]);

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !refreshing && !loading) {
      const nextPage = page + 1;
      console.log('⬇️ Loading more, next page:', nextPage);
      setPage(nextPage);
      loadNews(nextPage, false);
    } else {
      console.log('⏸️ Load more blocked:', {
        isLoadingMore,
        hasMore,
        refreshing,
        loading,
        currentTotal: news.length,
        totalAvailable: totalResults
      });
    }
  }, [isLoadingMore, hasMore, refreshing, loading, page, loadNews, news.length, totalResults]);

  useEffect(() => {
    console.log('🔄 Category changed, resetting...');
    setPage(1);
    setNews([]);
    setHasMore(true);
    setError(null);
    setTotalResults(0);
    loadNews(1, true);
  }, [category]);

  const renderNewsItem = ({ item }: { item: NewsItem }) => (
    <NewCard
      title={item.title}
      date={new Date(item.publishedAt).toLocaleDateString('ru-RU')}
      source={item.source.name}
      image={item.urlToImage}
      url={item.url}
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
      </LoadingContainer>
    );
  };

  const renderEmpty = () => {
    if (loading || refreshing) return null;
    
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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1976d2']}
            tintColor="#1976d2"
          />
        }
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