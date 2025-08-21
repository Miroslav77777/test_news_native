import axios from 'axios';
import { NEWS_API_KEY } from '@env';

interface CacheEntry {
    data: any;
    timestamp: number;
}

// Кеш для API запросов
const API_CACHE_TTL = 60 * 60 * 1000;
const apiCache = new Map<string, CacheEntry>();

// Функция для создания ключа кеша на основе параметров запроса
const createCacheKey = (endpoint: string, params: any): string => {
    const sortedParams = Object.keys(params)
        .sort()
        .map(key => `${key}:${params[key]}`)
        .join('|');
    return `${endpoint}|${sortedParams}`;
};

// Функция для проверки валидности кеша
const isCacheValid = (timestamp: number): boolean => {
    return Date.now() - timestamp < API_CACHE_TTL;
};

// Функция для получения данных из кеша
const getFromCache = (cacheKey: string): any | null => {
    const cached = apiCache.get(cacheKey);
    if (cached && isCacheValid(cached.timestamp)) {
        console.log('Using cached data for:', cacheKey);
        return cached.data;
    }
    
    if (cached) {
        apiCache.delete(cacheKey);
    }
    
    return null;
};

const saveToCache = (cacheKey: string, data: any): void => {
    apiCache.set(cacheKey, {
        data,
        timestamp: Date.now()
    });
            console.log('Cached data for:', cacheKey);
};

const cleanupExpiredCache = (): void => {
    for (const [key, entry] of apiCache.entries()) {
        if (!isCacheValid(entry.timestamp)) {
            apiCache.delete(key);
        }
    }
};

setInterval(cleanupExpiredCache, 30 * 60 * 1000);

const api = axios.create({
    baseURL: 'https://newsapi.org/v2',
});

const apiKey = NEWS_API_KEY;

// Проверяем наличие API ключа
if (!apiKey) {
    console.error('NEWS_API_KEY не найден в переменных окружения!');
    console.error('Создайте файл .env в корне проекта и добавьте:');
    console.error('NEWS_API_KEY=your_actual_api_key_here');
    throw new Error('NEWS_API_KEY не настроен. Создайте файл .env с вашим API ключом.');
}

// Проверяем формат API ключа (должен быть 32 символа)
if (apiKey.length !== 32) {
    console.error('Неверный формат NEWS_API_KEY!');
    console.error('API ключ должен содержать 32 символа');
    throw new Error('Неверный формат NEWS_API_KEY. Проверьте ваш API ключ.');
}

console.log('API Key loaded successfully !');

// Список часто используемых слов для фильтрации
const stopWords = [
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
    'my', 'your', 'his', 'her', 'its', 'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs',
    'what', 'when', 'where', 'why', 'how', 'who', 'which', 'whom', 'whose',
    'if', 'then', 'else', 'than', 'as', 'so', 'because', 'since', 'although', 'though',
    'very', 'really', 'quite', 'just', 'only', 'even', 'still', 'also', 'too', 'well',
    'good', 'bad', 'big', 'small', 'new', 'old', 'high', 'low', 'right', 'wrong',
    'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once',
    'here', 'there', 'whence', 'wherever', 'now', 'today', 'tomorrow', 'yesterday',
    'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
    'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'shows',
    'from', 'about', 'for', 'of', 'with', 'by', 'is'
];

const filterAndCleanArticles = (articles: any[]) => {
    return articles
        .filter((article: any) => 
            article.content && article.content.trim().length > 0
        )
        .map((article: any) => {
            const cleanedContent = article.content
                .replace(/\[\+\d+\s*chars?\]/gi, '') // Убираем [+n chars]
                .replace(/<[^>]*>/g, '') // Убираем HTML теги
                .replace(/&[a-zA-Z0-9#]+;/g, ' ') // Убираем HTML entities
                .replace(/\s+/g, ' ') // Заменяем множественные пробелы на один
                .replace(/\n/g, " ") // Заменяем переносы строк на пробелы
                .replace(/^['"]|['"]$/g, '') // Убираем кавычки в начале и конце строки
                .trim();
            
            const articleData = {
                ...article,
                content: cleanedContent
            };
            
            if (article.description && article.description.trim() === cleanedContent) {
                delete articleData.description;
            }
            
            return articleData;
        });
};



export const getNews = async function getNews(category: string, page: number, useEverything: boolean = false) {
    const pageSize = 10;
    const country = 'us';

    try {
        let response;
        let endpoint = '';
        let params: any = {};
        
        if (useEverything) {
            endpoint = '/everything';
            params = {
                q: category === 'all' ? 'news' : category,
                apiKey,
                pageSize,
                page,
                sortBy: 'publishedAt',
                language: 'en'
            };
            
            const cacheKey = createCacheKey(endpoint, params);
            const cachedData = getFromCache(cacheKey);
            if (cachedData) {
                return cachedData;
            }
            
            console.log('Fetching from everything, page:', page);
            response = await api.get(endpoint, { params });
        } else {
            switch (category) {
                case 'all':
                    endpoint = '/top-headlines';
                    params = {
                        apiKey,
                        pageSize,
                        page,
                        country,
                    };
                    break;
                    
                case 'politics':
                    endpoint = '/everything';
                    params = {
                        sources: 'bbc-news,cnn,politico,reuters',
                        q: 'politics OR election OR government OR parliament',
                        apiKey,
                        pageSize,
                        page,
                        sortBy: 'publishedAt',
                    };
                    break;
                    
                default:
                    endpoint = '/top-headlines';
                    params = {
                        category,
                        apiKey,
                        pageSize,
                        page,
                        country,
                    };
                    break;
            }
            
            const cacheKey = createCacheKey(endpoint, params);
            const cachedData = getFromCache(cacheKey);
            if (cachedData) {
                return cachedData;
            }
            
            if (category === 'all') {
                console.log('Fetching top headlines, page:', page);
            }
            response = await api.get(endpoint, { params });
        }
        
        const filteredArticles = filterAndCleanArticles(response.data?.articles || []);
        
        const updatedTotalResults = response.data?.totalResults ? 
            Math.max(0, response.data.totalResults - (response.data.articles?.length || 0) + filteredArticles.length) : 
            filteredArticles.length;
        
        const result = {
            ...response.data,
            articles: filteredArticles,
            totalResults: updatedTotalResults
        };
        
        const searchCacheKey = createCacheKey(endpoint, params);
        saveToCache(searchCacheKey, result);
        
        console.log('API Response:', {
            status: response.status,
            articlesCount: response.data?.articles?.length || 0,
            filteredArticlesCount: filteredArticles.length,
            totalResults: response.data?.totalResults || 0,
            updatedTotalResults,
            currentPage: page,
            pageSize: pageSize,
            endpoint: useEverything ? 'everything' : 'top-headlines'
        });
        
        return result;
        
    } catch (error: any) {
        console.error('API Error:', {
            message: error.message,
            status: error.response?.status,
            page: page,
            category: category,
            useEverything: useEverything,
            
        });
        throw error;
    }
};

// Функция для поиска новостей
export const searchNews = async (query: string, page: number = 1, type: string = 'default') => {
    const pageSize = 10;
    const endpoint = '/everything';
    const params = {
        q: type === 'input' ? query.trim().split(/\s+/).slice(0, 3).join(' ') : query,
        apiKey,
        pageSize,
        page,
        sortBy: 'publishedAt',
        language: 'en',
        searchIn: 'title'
    };

    try {
        const cacheKey = createCacheKey(endpoint, params);
        const cachedData = getFromCache(cacheKey);
        if (cachedData) {
            return cachedData;
        }
        
        console.log('Searching news manual:', { query, page });
        
        const response = await api.get(endpoint, { params });
        
        const filteredArticles = filterAndCleanArticles(response.data?.articles || []);
        
        const updatedTotalResults = response.data?.totalResults ? 
            Math.max(0, response.data.totalResults - (response.data.articles?.length || 0) + filteredArticles.length) : 
            filteredArticles.length;
        
        const result = {
            ...response.data,
            articles: filteredArticles,
            totalResults: updatedTotalResults
        };
        
        const searchCacheKey = createCacheKey(endpoint, params);
        saveToCache(searchCacheKey, result);
        
        console.log('Search Response:', {
            status: response.status,
            articlesCount: response.data?.articles?.length || 0,
            filteredArticlesCount: filteredArticles.length,
            totalResults: response.data?.totalResults || 0,
            updatedTotalResults,
            currentPage: page,
            pageSize: pageSize,
            query
        });
        console.trace()
        
        return result;
        
    } catch (error: any) {
        console.error('Search API Error:', {
            message: error.message,
            status: error.response?.status,
            page: page,
            query
        });
        throw error;
    }
};

export const getNewsByWords = async (searched: string, words: string, page: number = 1) => {
    const pageSize = 10;
    const endpoint = '/everything';
    
    try {
        // Разбиваем words на отдельные слова, фильтруем стоп-слова и соединяем их через OR
        const wordArray = words
            .split(' ')
            .filter(word => word.trim().length > 0)
            .filter(word => !stopWords.includes(word.toLowerCase()));
        
        const wordsQuery = wordArray.length > 0 ? `(${wordArray.join(' OR ')})` : '';
        
        let finalQuery = searched;
        if (wordsQuery) {
            finalQuery = `${searched} AND ${wordsQuery}`;
        }
        
        const params = {
            q: finalQuery,
            apiKey,
            pageSize,
            page,
            sortBy: 'publishedAt',
            language: 'en',
            searchIn: 'title'
        };
        
        const cacheKey = createCacheKey(endpoint, params);
        const cachedData = getFromCache(cacheKey);
        if (cachedData) {
            return cachedData;
        }
        
        console.log('Complex search query auto:', { searched, words, finalQuery });
        
        const response = await api.get(endpoint, { params });
        
        const filteredArticles = filterAndCleanArticles(response.data?.articles || []);
        
        const updatedTotalResults = response.data?.totalResults ? 
            Math.max(0, response.data.totalResults - (response.data.articles?.length || 0) + filteredArticles.length) : 
            filteredArticles.length;
        
        const result = {
            ...response.data,
            articles: filteredArticles,
            totalResults: updatedTotalResults
        };
        
        const wordsCacheKey = createCacheKey(endpoint, params);
        saveToCache(wordsCacheKey, result);
        
        console.log('Complex Search Response:', {
            status: response.status,
            articlesCount: response.data?.articles?.length || 0,
            filteredArticlesCount: filteredArticles.length,
            totalResults: response.data?.totalResults || 0,
            updatedTotalResults,
            currentPage: page,
            pageSize: pageSize,
            query: finalQuery
        });
        
        return result;
        
    } catch (error: any) {
        console.error('Complex Search API Error:', {
            message: error.message,
            status: error.response?.status,
            page: page,
            searched,
            words
        });
        throw error;
    }
};