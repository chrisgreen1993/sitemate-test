import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useSearchHistory = () => {
    const [searchHistory, setSearchHistory] = useState<string[]>([]);

    useEffect(() => {
        const loadSearchHistory = async () => {
            const searchHistory = await AsyncStorage.getItem('searchHistory');
            const parsedSearchHistory = searchHistory ? JSON.parse(searchHistory) : [];
            setSearchHistory(parsedSearchHistory);
        }
        loadSearchHistory()
    }, [searchHistory])

    const saveSearchTerm = async (searchTerm: string) => {
        const searchHistory = await AsyncStorage.getItem('searchHistory');
        const parsedSearchHistory = searchHistory ? JSON.parse(searchHistory) : [];
        const updatedSearchHistory = [searchTerm, ...parsedSearchHistory];
        AsyncStorage.setItem('searchHistory', JSON.stringify(updatedSearchHistory));
    }



    return { searchHistory, saveSearchTerm };
};