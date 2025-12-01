import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useTheme} from '../theme/ThemeContext';
import {Movie} from '../services/movieApi';
import {APP_STRINGS} from '../constants';
import styles from './styles';

type Props = {
  favorites: Movie[];
  onPressMovie: (movieId: number) => void;
  onRemoveFavorite?: (movieId: number) => void;
};

export default function FavoritesSection({favorites, onPressMovie, onRemoveFavorite}: Props) {
  const theme = useTheme();

  return (
    <View style={styles.favoritesSection}>
      <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
        {APP_STRINGS.YOUR_FAVORITES}
      </Text>

      {favorites.length === 0 ? (
        <Text style={[styles.emptyText, {color: theme.colors.mutedText}]}>
          {APP_STRINGS.NO_MOVIES_ADDED}
        </Text>
      ) : (
        <FlatList
          horizontal
          data={favorites}
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
