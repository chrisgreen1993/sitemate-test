

const API_KEY = process.env.EXPO_PUBLIC_NEWS_API_KEY

interface Source {
    id: string;
    name: string;
}

export interface Article {
    source: Source;
    author: string;
    title: string;
    description: string;
    url: string;
    urlToImage: string;
    publishedAt: string;
    content: string;
}

export const searchAllNews = async (searchTerm: string): Promise<Article[]> => {
    const res = await fetch(`https://newsapi.org/v2/everything?q=${searchTerm}&pageSize=20&apiKey=${API_KEY}`);
    if (!res.ok) {
        throw Error(res.statusText);
    }
    const data = await res.json();
    return data.articles;
};