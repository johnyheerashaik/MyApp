import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { useAppSelector } from '../store/rtkHooks';
import { Movie } from '../store/movies/types';
import { STRINGS } from '../common/strings';
import styles from './styles';
import { SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../constants';

type SortOption = 'rating' | 'year' | 'title';

type Props = {
  favorites: Movie[];
  onPressMovie: (movieId: number) => void;
  onRemoveFavorite?: (movieId: number) => void;
};

export default function FavoritesSection({ favorites, onPressMovie, onRemoveFavorite }: Props) {
  const theme = useAppSelector(state => state.theme);
  const [sortBy, setSortBy] = useState<SortOption>('rating');

  const sortedFavorites = useMemo(() => {
    const sorted = [...favorites];

    switch (sortBy) {
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'year':
        return sorted.sort((a, b) => {
          const yearA = Number.parseInt(a.year) || 0;
          const yearB = Number.parseInt(b.year) || 0;
          return yearB - yearA;
        });
      case 'title':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return sorted;
    }
  }, [favorites, sortBy]);

  return (
    <View style={styles.favoritesSection}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {STRINGS.YOUR_FAVORITES}
        </Text>
        {favorites.length > 0 && (
          <Text style={[styles.countBadge, { color: theme.colors.mutedText }]}>
            {favorites.length}
          </Text>
        )}
      </View>

      {favorites.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortButtons}>
          <TouchableOpacity
            style={[
              styles.sortButton,
              { backgroundColor: sortBy === 'rating' ? theme.colors.primary : theme.colors.card },
            ]}
            onPress={() => setSortBy('rating')}>
            <Text style={[styles.sortButtonText, { color: sortBy === 'rating' ? theme.colors.white : theme.colors.text }]}>
              {STRINGS.RATING_LABEL}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortButton,
              { backgroundColor: sortBy === 'year' ? theme.colors.primary : theme.colors.card },
            ]}
            onPress={() => setSortBy('year')}>
            <Text style={[styles.sortButtonText, { color: sortBy === 'year' ? theme.colors.white : theme.colors.text }]}>
              {STRINGS.YEAR_LABEL}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortButton,
              { backgroundColor: sortBy === 'title' ? theme.colors.primary : theme.colors.card },
            ]}
            onPress={() => setSortBy('title')}>
            <Text style={[styles.sortButtonText, { color: sortBy === 'title' ? theme.colors.white : theme.colors.text }]}>
              {STRINGS.TITLE_LABEL}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {favorites.length === 0 ? (
        <Text style={[styles.emptyText, { color: theme.colors.mutedText }]}>
          {STRINGS.NO_MOVIES_ADDED}
        </Text>
      ) : (
        <View style={{ minHeight: SPACING.XXXL, paddingBottom: SPACING.BASE }}>
          <FlatList
            horizontal
            data={sortedFavorites}
            keyExtractor={(item, index) =>
              item?.id != null ? String(item.id) : `favorite-${index}`
            }
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: SPACING.XL, paddingBottom: SPACING.SM }}
            renderItem={({ item }) => (
              <View style={styles.favoriteItem}>
                <TouchableOpacity
                  onPress={() => onPressMovie(item.id)}>
                  {item.poster && (
                    <Image
                      source={{ uri: item.poster }}
                      style={styles.favoritePoster}
                    />
                  )}

                  {item.reminderEnabled && (
                    <View style={[styles.reminderBadge, { backgroundColor: theme.colors.primary }]}>
                      <Text style={styles.reminderBadgeText}>🔔</Text>
                    </View>
                  )}

                  <Text
                    numberOfLines={1}
                    style={[
                      styles.favoriteTitle,
                      { color: theme.colors.text },
                    ]}>
                    {item.title}
                  </Text>
                </TouchableOpacity>

                {onRemoveFavorite && (
                  <TouchableOpacity
                    style={[styles.removeButton, {
                      backgroundColor: theme.colors.danger,
                    }]}
                    onPress={() => onRemoveFavorite(item.id)}>
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          />
        </View>
      )}
    </View>
  );
}
