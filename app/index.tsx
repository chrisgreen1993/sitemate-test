import React, { useEffect, useState } from 'react';
import { FlatList, Keyboard, Linking } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Searchbar, Text, Button, Card, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { searchAllNews, Article } from '@/api/newsApi';

function Index() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchHistory, setSearchHistory] = useState([])
  const latestSearchHistory = searchHistory.slice(0, 3);

  const { data: articles, refetch, error, isFetching } = useQuery<Article[]>({
    queryKey: ['news'],
    queryFn: () => searchAllNews(searchTerm),
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

  const handleSearchHistoryOnPress = (searchTerm: string) => {
    setSearchTerm(searchTerm)
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
              <Text variant="bodySmall" onPress={() => handleSearchHistoryOnPress(item)}>{item}</Text>
            </Card.Content>
          </Card>
        ))
      )}

      {isFetching && <ActivityIndicator animating />}
      {error && <Text>Whoops! Looks like something went wrong!</Text>}
      {!isFetching && (
        <FlatList
          data={articles}
          keyExtractor={(_item, index) => index.toString()}
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