import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import {useTheme} from '../theme/ThemeContext';
import {Movie} from '../services/movieApi';
import {APP_STRINGS} from '../constants';
import styles from './styles';

type SortOption = 'rating' | 'year' | 'title';

type Props = {
  favorites: Movie[];
  onPressMovie: (movieId: number) => void;
  onRemoveFavorite?: (movieId: number) => void;
};

export default function FavoritesSection({favorites, onPressMovie, onRemoveFavorite}: Props) {
  const theme = useTheme();
  const [sortBy, setSortBy] = useState<SortOption>('rating');

  const sortedFavorites = useMemo(() => {
    const sorted = [...favorites];
    
    switch (sortBy) {
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'year':
        return sorted.sort((a, b) => {
          const yearA = parseInt(a.year) || 0;
          const yearB = parseInt(b.year) || 0;
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
        <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
          {APP_STRINGS.YOUR_FAVORITES}
        </Text>
        {favorites.length > 0 && (
          <Text style={[styles.countBadge, {color: theme.colors.mutedText}]}>
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
              {backgroundColor: sortBy === 'rating' ? theme.colors.primary : theme.colors.card},
            ]}
            onPress={() => setSortBy('rating')}>
            <Text style={[styles.sortButtonText, {color: sortBy === 'rating' ? '#fff' : theme.colors.text}]}>
              ⭐ Rating
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortButton,
              {backgroundColor: sortBy === 'year' ? theme.colors.primary : theme.colors.card},
            ]}
            onPress={() => setSortBy('year')}>
            <Text style={[styles.sortButtonText, {color: sortBy === 'year' ? '#fff' : theme.colors.text}]}>
              📅 Year
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortButton,
              {backgroundColor: sortBy === 'title' ? theme.colors.primary : theme.colors.card},
            ]}
            onPress={() => setSortBy('title')}>
            <Text style={[styles.sortButtonText, {color: sortBy === 'title' ? '#fff' : theme.colors.text}]}>
              🔤 Title
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {favorites.length === 0 ? (
        <Text style={[styles.emptyText, {color: theme.colors.mutedText}]}>
          {APP_STRINGS.NO_MOVIES_ADDED}
        </Text>
      ) : (
        <FlatList
          horizontal
          data={sortedFavorites}
          keyExtractor={item => String(item.id)}
          showsHorizontalScrollIndicator={false}
          renderItem={({item}) => (
            <View style={styles.favoriteItem}>
              <TouchableOpacity
                onPress={() => onPressMovie(item.id)}>
                {item.poster && (
                  <Image
                    source={{uri: item.poster}}
                    style={styles.favoritePoster}
                  />
                )}
                
                {/* Reminder indicator badge */}
                {item.reminderEnabled && (
                  <View style={[styles.reminderBadge, {backgroundColor: theme.colors.primary}]}>
                    <Text style={styles.reminderBadgeText}>🔔</Text>
                  </View>
                )}
                
                <Text
                  numberOfLines={1}
                  style={[
                    styles.favoriteTitle,
                    {color: theme.colors.text},
                  ]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
              
              {/* Remove button */}
              {onRemoveFavorite && (
                <TouchableOpacity
                  style={[styles.removeButton, {
                    backgroundColor: theme.mode === 'dark' 
                      ? 'rgba(239, 68, 68, 0.9)' 
                      : '#ef4444',
                  }]}
                  onPress={() => onRemoveFavorite(item.id)}>
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}
