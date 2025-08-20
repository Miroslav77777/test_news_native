import axios from 'axios';
import Config from 'react-native-config';


const api = axios.create({
    baseURL: 'https://newsapi.org/v2',
});

const apiKey = Config.NEWS_API_KEY;
console.log(apiKey);

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
            // Очищаем content
            const cleanedContent = article.content
                .replace(/\[\+\d+\s*chars?\]/gi, '') // Убираем [+n chars]
                .replace(/<[^>]*>/g, '') // Убираем HTML теги
                .replace(/&[a-zA-Z0-9#]+;/g, ' ') // Убираем HTML entities
                .replace(/\s+/g, ' ') // Заменяем множественные пробелы на один
                .replace(/\n/g, " ") // Заменяем переносы строк на пробелы
                .replace(/^['"]|['"]$/g, '') // Убираем кавычки в начале и конце строки
                .trim();
            
            // Убираем description если он равен content
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
                        response = await api.get('/everything', {
                            params: {
                              sources: 'bbc-news,cnn,politico,reuters',
                              q: 'politics OR election OR government OR parliament',
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
        
        // Фильтруем статьи с пустым content и очищаем от [+n chars] и HTML тегов
        const filteredArticles = filterAndCleanArticles(response.data?.articles || []);
        
        // Обновляем totalResults с учетом отфильтрованных статей
        const updatedTotalResults = response.data?.totalResults ? 
            Math.max(0, response.data.totalResults - (response.data.articles?.length || 0) + filteredArticles.length) : 
            filteredArticles.length;
        
        console.log('✅ API Response:', {
            status: response.status,
            articlesCount: response.data?.articles?.length || 0,
            filteredArticlesCount: filteredArticles.length,
            totalResults: response.data?.totalResults || 0,
            updatedTotalResults,
            currentPage: page,
            pageSize: pageSize,
            endpoint: useEverything ? 'everything' : 'top-headlines'
        });
        
        return {
            ...response.data,
            articles: filteredArticles,
            totalResults: updatedTotalResults
        };
        
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

// Функция для поиска новостей
export const searchNews = async (query: string, page: number = 1, type: string = 'default') => {
    const pageSize = 10;

    
    try {
        console.log('🔍 Searching news manual:', { query, page });
        
        const response = await api.get('/everything', {
            params: {
                q: type === 'input' ? query.trim().split(/\s+/).slice(0, 3).join(' ') : query,
                apiKey,
                pageSize,
                page,
                sortBy: 'publishedAt',
                language: 'en',
                searchIn: 'title'
            },
        });
        
        // Фильтруем статьи с пустым content и очищаем от [+n chars] и HTML тегов
        const filteredArticles = filterAndCleanArticles(response.data?.articles || []);
        
        // Обновляем totalResults с учетом отфильтрованных статей
        const updatedTotalResults = response.data?.totalResults ? 
            Math.max(0, response.data.totalResults - (response.data.articles?.length || 0) + filteredArticles.length) : 
            filteredArticles.length;
        
        console.log('✅ Search Response:', {
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
        
        return {
            ...response.data,
            articles: filteredArticles,
            totalResults: updatedTotalResults
        };
        
    } catch (error: any) {
        console.error('❌ Search API Error:', {
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
    
    try {
        // Разбиваем words на отдельные слова, фильтруем стоп-слова и соединяем их через OR
        const wordArray = words
            .split(' ')
            .filter(word => word.trim().length > 0)
            .filter(word => !stopWords.includes(word.toLowerCase()));
        
        const wordsQuery = wordArray.length > 0 ? `(${wordArray.join(' OR ')})` : '';
        
        // Формируем финальный поисковый запрос
        let finalQuery = searched;
        if (wordsQuery) {
            finalQuery = `${searched} AND ${wordsQuery}`;
        }
        
        console.log('🔍 Complex search query auto:', { searched, words, finalQuery });
        
        const response = await api.get('/everything', {
            params: {
                q: finalQuery,
                apiKey,
                pageSize,
                page,
                sortBy: 'publishedAt',
                language: 'en',
                searchIn: 'title'
            },
        });
        
        // Фильтруем статьи с пустым content и очищаем от [+n chars] и HTML тегов
        const filteredArticles = filterAndCleanArticles(response.data?.articles || []);
        
        // Обновляем totalResults с учетом отфильтрованных статей
        const updatedTotalResults = response.data?.totalResults ? 
            Math.max(0, response.data.totalResults - (response.data.articles?.length || 0) + filteredArticles.length) : 
            filteredArticles.length;
        
        console.log('✅ Complex Search Response:', {
            status: response.status,
            articlesCount: response.data?.articles?.length || 0,
            filteredArticlesCount: filteredArticles.length,
            totalResults: response.data?.totalResults || 0,
            updatedTotalResults,
            currentPage: page,
            pageSize: pageSize,
            query: finalQuery
        });
        
        return {
            ...response.data,
            articles: filteredArticles,
            totalResults: updatedTotalResults
        };
        
    } catch (error: any) {
        console.error('❌ Complex Search API Error:', {
            message: error.message,
            status: error.response?.status,
            page: page,
            searched,
            words
        });
        throw error;
    }
};