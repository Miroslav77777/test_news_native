import axios from 'axios';
import Config from 'react-native-config';


const api = axios.create({
    baseURL: 'https://newsapi.org/v2',
});

const apiKey = Config.NEWS_API_KEY || '58ba7bfa61884dd2a444e94e979e5b0a';
console.log(apiKey);
export const getNews = async (category: string, page: number) => {
    const pageSize = 10;
    const country = 'us';

    try {
        let response;
        
        switch (category) {
            case 'all':
                console.log(' Fetching all news, page:', page);
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
                response = await api.get('/everything', {
                    params: {
                        q: category,
                        apiKey,
                        pageSize,
                        page,
                        country,
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
        
        console.log('✅ API Response:', {
            status: response.status,
            articlesCount: response.data?.articles?.length || 0,
            totalResults: response.data?.totalResults || 0,
            currentPage: page,
            pageSize: pageSize
        });
        
        // Возвращаем весь response.data
        return response.data;
        
    } catch (error: any) {
        console.error('❌ API Error:', {
            message: error.message,
            status: error.response?.status,
            page: page,
            category: category
        });
        throw error;
    }
};