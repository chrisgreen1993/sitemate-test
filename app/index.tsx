import React, { useState } from 'react';
import { FlatList, Keyboard, Linking } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Searchbar, Text, Button, Card, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { searchAllNews, Article } from '@/api/newsApi';
import { useSearchHistory } from '@/hooks/useSearchHistory';

function Index() {
  const [searchTerm, setSearchTerm] = useState('');
  const { searchHistory, saveSearchTerm } = useSearchHistory();
  const latestSearchHistory = searchHistory.slice(0, 3);

  const { data: articles, refetch, error, isFetching } = useQuery<Article[]>({
    queryKey: ['news'],
    queryFn: () => searchAllNews(searchTerm),
    enabled: false,
    retry: false
  });

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
          <Card key={index} onPress={() => handleSearchHistoryOnPress(item)}>
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
          keyExtractor={(_item, index) => index.toString()}
          renderItem={({ item }) => (
            <Card onPress={() => Linking.openURL(item.url)}>
              <Card.Content>
                <Text variant="titleSmall">{item.title}</Text>
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