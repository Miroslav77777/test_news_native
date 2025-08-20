import { NewsItem } from "./components/NewsList";

export type RootStackParamList = {
    Home: undefined;
    Details: {
        title: string;
        image: string;
        description: string;
        content: string;
        url: string;
        date: string;
        source: string;
    };
    SearchResults: { searchQuery: string, queryType: string, news: NewsItem[] };
};