import axios from 'axios';
import Config from 'react-native-config';


const api = axios.create({
    baseURL: 'https://newsapi.org/v2',
});

const apiKey = Config.NEWS_API_KEY;
console.log(apiKey);
export const getNews = async (category: string, page: number, useEverything: boolean = false) => {
    const pageSize = 10;
    const country = 'us';

    try {
        let response;
        
        if (useEverything) {
            // Используем /everything для поиска по всем новостям
            console.log('🔍 Fetching from everything, page:', page);
            response = await api.get('/everything', {
                params: {
                    q: category === 'all' ? 'news' : category, // Для 'all' ищем по 'news'
                    apiKey,
                    pageSize,
                    page,
                    sortBy: 'publishedAt',
                    language: 'en'
                },
            });
        } else {
            // Используем /top-headlines для топ-новостей
            switch (category) {
                case 'all':
                    console.log('📰 Fetching top headlines, page:', page);
                    response = await api.get('/top-headlines', {
                        params: {
                            apiKey,
                            pageSize,
                            page,
                            country,
                        },
                    });
                    break;
                    
                    case 'politics':
                        response = await api.get('/top-headlines', {
                            params: {
                                // вместо category указываем источники
                                sources: 'bbc-news,cnn,politico,reuters',
                                apiKey,
                                pageSize,
                                page,
                                sortBy: 'publishedAt',
                            },
                        });
                        break;
                    
                default:
                    response = await api.get('/top-headlines', {
                        params: {
                            category,
                            apiKey,
                            pageSize,
                            page,
                            country,
                        },
                    });
                    break;
            }
        }
        
        console.log('✅ API Response:', {
            status: response.status,
            articlesCount: response.data?.articles?.length || 0,
            totalResults: response.data?.totalResults || 0,
            currentPage: page,
            pageSize: pageSize,
            endpoint: useEverything ? 'everything' : 'top-headlines'
        });
        
        return response.data;
        
    } catch (error: any) {
        console.error('❌ API Error:', {
            message: error.message,
            status: error.response?.status,
            page: page,
            category: category,
            useEverything: useEverything,
            
        });
        throw error;
    }
};