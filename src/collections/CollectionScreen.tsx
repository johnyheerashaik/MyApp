import React, {useEffect, useState} from 'react';
import {
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  View,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from '../theme/ThemeContext';
import { Movie} from '../services/movieApi';
import {useFavorites} from '../favorites/FavoritesContext';
import styles from './styles';
import { logError } from '../services/analytics';

type Props = {
  navigation: any;
  route: any;
};

export default function CollectionScreen({navigation, route}: Props) {
  const theme = useTheme();
  const {isFavorite, toggleFavorite} = useFavorites();
  const {title, collectionId, keywordId} = route.params;

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCollection();
    import('../services/analytics').then(({logCollectionView}) => {
      logCollectionView(title || 'unknown');
    });
  }, [collectionId, keywordId]);

  const loadCollection = async () => {
    setLoading(true);
    try {
      if (collectionId) {
        const {getMoviesByCollection} = await import('../services/movieApi');
        const results = await getMoviesByCollection(collectionId);
        setMovies(results);
      } else if (keywordId) {
        const {getMoviesByKeyword} = await import('../services/movieApi');
        const results = await getMoviesByKeyword(keywordId);
        setMovies(results);
      }
    } catch (error) {
      logError(error as any, 'Failed to load collection');
    } finally {
      setLoading(false);
    }
  };

  const renderMovie = ({item}: {item: Movie}) => {
    const favorite = isFavorite(item.id);

    return (
      <TouchableOpacity
        style={[styles.movieCard, {backgroundColor: theme.colors.card}]}
        onPress={() => navigation.navigate('MovieDetails', {movieId: item.id})}>
        {item.poster && (
          <Image source={{uri: item.poster}} style={styles.poster} />
        )}
        <View style={styles.movieInfo}>
          <Text style={[styles.movieTitle, {color: theme.colors.text}]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.movieMeta, {color: theme.colors.mutedText}]}>
            {item.year} • ⭐ {item.rating.toFixed(1)}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.favoriteButton, {backgroundColor: 'rgba(0,0,0,0.5)'}]}
          onPress={() => toggleFavorite(item)}>
          <Text
            style={[
              styles.favoriteIcon,
              {color: favorite ? theme.colors.primary : '#ffffff'},
            ]}>
            {favorite ? '♥' : '♡'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.screen, {backgroundColor: theme.colors.background}]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, {backgroundColor: theme.colors.card}]}
          onPress={() => navigation.goBack()}>
          <Text style={[styles.backIcon, {color: theme.colors.text}]}>{'‹'}</Text>
        </TouchableOpacity>

        <Text style={[styles.headerTitle, {color: theme.colors.text}]} numberOfLines={1}>
          {title}
        </Text>

        <View style={{width: 32}} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : movies.length === 0 ? (
        <View style={styles.center}>
          <Text style={[styles.emptyText, {color: theme.colors.mutedText}]}>
            No movies found in this collection
          </Text>
        </View>
      ) : (
        <FlatList
          data={movies}
          renderItem={renderMovie}
          keyExtractor={item => String(item.id)}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
