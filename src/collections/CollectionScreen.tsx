import React, { useEffect, useState } from 'react';
import {
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  View,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppSelector } from '../store/rtkHooks';
import { selectTheme } from '../store/theme/selectors';
import { selectCurrentCollectionMovies, selectCurrentCollectionLoading, selectCurrentCollectionError } from '../store/movies/selectors';
import { useFavorites } from '../store/favorites/hooks';
import styles from './styles';
import { DARK_THEME_COLORS } from '../constants/colors';
import { SPACING } from '../constants/spacing';
import { logError, logCollectionView } from '../services/analytics';
import type { Movie } from '../store/movies/types';
import { useMoviesActions } from '../store/movies/hooks';
import { STRINGS } from '../common/strings';
import { ACCESSIBILITY_STRINGS } from '../common/accessibilityStrings';

type Props = {
  navigation: any;
  route: any;
};

export default function CollectionScreen({ navigation, route }: Props) {
  const theme = useAppSelector(selectTheme);
  const { isFavorite } = useFavorites();
  const { title, collectionId, keywordId } = route.params;
  const movies = useAppSelector(selectCurrentCollectionMovies);
  const loading = useAppSelector(selectCurrentCollectionLoading);
  const error = useAppSelector(selectCurrentCollectionError);
  const { fetchByCollection, fetchByKeyword } = useMoviesActions();

  useEffect(() => {
    if (error) {
      logError(new Error(error), 'CollectionScreen error');
    }
  }, [error]);

  useEffect(() => {
    if (collectionId) {
      fetchByCollection(collectionId);
    } else if (keywordId) {
      fetchByKeyword(keywordId);
    }
    logCollectionView(title || 'unknown');
  }, [collectionId, keywordId, fetchByCollection, fetchByKeyword, title]);

  const renderMovie = ({ item }: { item: Movie }) => {
    const favorite = isFavorite(item.id);
    return (
      <TouchableOpacity
        style={[styles.movieCard, { backgroundColor: theme.colors.card }]}
        onPress={() => navigation.navigate('MovieDetails', { movieId: item.id })}
        accessibilityRole="button"
        accessibilityLabel={ACCESSIBILITY_STRINGS.MOVIE_CARD_LABEL}
        accessibilityHint={ACCESSIBILITY_STRINGS.MOVIE_CARD_HINT}
      >
        {typeof item.poster === 'string' && (
          <Image source={{ uri: item.poster }} style={styles.poster} />
        )}
        <View style={styles.movieInfo}>
          <Text style={[styles.movieTitle, { color: theme.colors.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.movieMeta, { color: theme.colors.mutedText }]}>{item.year} • ⭐ {item.rating.toFixed(1)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.favoriteButton, { backgroundColor: DARK_THEME_COLORS.overlay }]}
          accessibilityRole="button"
          accessibilityLabel={favorite ? ACCESSIBILITY_STRINGS.REMOVE_FAVORITE_LABEL : ACCESSIBILITY_STRINGS.ADD_FAVORITE_LABEL}
          accessibilityHint={favorite ? ACCESSIBILITY_STRINGS.REMOVE_FAVORITE_HINT : ACCESSIBILITY_STRINGS.ADD_FAVORITE_HINT}
        >
          <Text
            style={[
              styles.favoriteIcon,
              { color: favorite ? theme.colors.primary : DARK_THEME_COLORS.white },
            ]}
          >
            {favorite ? '♥' : '♡'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel={ACCESSIBILITY_STRINGS.BACK_BUTTON_LABEL}
          accessibilityHint={ACCESSIBILITY_STRINGS.BACK_BUTTON_HINT}
        >
          <Text style={[styles.backIcon, { color: theme.colors.text }]}>{'‹'}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        <View style={{ width: SPACING.XXL }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : Array.isArray(movies) && movies.length === 0 ? (
        <View style={styles.center}>
          <Text style={[styles.emptyText, { color: theme.colors.mutedText }]}>{STRINGS.NO_MOVIES_FOUND}</Text>
        </View>
      ) : (
        <FlatList
          data={Array.isArray(movies) ? movies : []}
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
