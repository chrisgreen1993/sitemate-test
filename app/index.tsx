import React, { useEffect, useState } from 'react';
import { FlatList, Keyboard, Linking } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Searchbar, Text, Button, Card, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY = process.env.EXPO_PUBLIC_NEWS_API_KEY

const fetchNews = async (searchTerm: string) => {
  const res = await fetch(`https://newsapi.org/v2/everything?q=${searchTerm}&apiKey=${API_KEY}`);
  if (!res.ok) {
    throw Error('Network response was not ok');
  }
  const data = await res.json();
  return data.articles;
};

function Index() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchHistory, setSearchHistory] = useState([])
  const latestSearchHistory = searchHistory.slice(0, 3);

  const { data: articles, refetch, error, isFetching } = useQuery({
    queryKey: ['news'],
    queryFn: () => fetchNews(searchTerm),
    enabled: false,
    retry: false
  });

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

  const handleSearchOnPress = () => {
    saveSearchTerm(searchTerm);
    refetch();
    Keyboard.dismiss();
  }

  return (
    <SafeAreaView>
      <Searchbar
        placeholder="Search"
        onChangeText={setSearchTerm}
        value={searchTerm}
        onSubmitEditing={() => refetch()}
      />
      <Button disabled={!searchTerm.length} mode="contained" onPress={handleSearchOnPress}>Search News</Button>
      {!!searchHistory.length && (
        latestSearchHistory.map((item, index) => (
          <Card key={index}>
            <Card.Content>
              <Text variant="bodySmall">{item}</Text>
            </Card.Content>
          </Card>
        ))
      )}

      {isFetching && <ActivityIndicator animating />}
      {error && <Text>Whoops! Looks like something went wrong!</Text>}
      {!isFetching && (
        <FlatList
          data={articles}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Card>
              <Card.Content>
                <Text variant="titleSmall" onPress={() => Linking.openURL(item.url)}>{item.title}</Text>
                <Text variant="bodySmall">{item.description}</Text>
              </Card.Content>
            </Card>
          )}
        />
      )}
    </SafeAreaView>
  );
}

export default Index;