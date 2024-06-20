import React, { useState } from 'react';
import { FlatList, Keyboard, Linking, Pressable, StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Searchbar, Text, Button, Card, ActivityIndicator, TouchableRipple } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { searchAllNews, Article } from '@/api/newsApi';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { TouchableOpacity } from 'react-native-gesture-handler';

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
      <View style={styles.container}>
        <Searchbar
          style={styles.defaultMargin}
          placeholder="Search News"
          onChangeText={setSearchTerm}
          value={searchTerm}
          onSubmitEditing={() => refetch()}
        />
        <Button style={styles.defaultMargin} disabled={!searchTerm.length} mode="contained" onPress={handleSearchOnPress}>Search News</Button>
        {!!searchHistory.length && (
          latestSearchHistory.map((item, index) => (
            <Pressable key={index}>
              <Card style={styles.defaultMargin} onPress={() => handleSearchHistoryOnPress(item)}>
                <Card.Content>
                  <Text variant="bodySmall">{item}</Text>
                </Card.Content>
              </Card>
            </Pressable>
          ))
        )}

        {isFetching && <ActivityIndicator style={styles.center} animating />}
        {error && <Text style={styles.center}>Whoops! Looks like something went wrong!</Text>}
        {!isFetching && (
          <FlatList
            data={articles}
            keyExtractor={(_item, index) => index.toString()}
            renderItem={({ item }) => (
              <Pressable>
                <Card style={styles.defaultMargin} onPress={() => Linking.openURL(item.url)}>
                  <Card.Content>
                    <Text variant="titleSmall">{item.title}</Text>
                    <Text variant="bodySmall">{item.description}</Text>
                  </Card.Content>
                </Card>
              </Pressable>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    margin: 5,
  },
  defaultMargin: {
    margin: 5
  }
});


export default Index;