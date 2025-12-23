import React, {memo, useCallback} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import type {Movie} from '../../services/movieApi';

type Props = {
  movies: Movie[];
  favoritesIds: Set<number>;
  mode: 'dark' | 'light';
  colors: any;
  styles: any;
  onAddMovie: (movie: Movie) => void;
};

function MovieSuggestionsBase({movies, favoritesIds, mode, colors, styles, onAddMovie}: Props) {
  const isDark = mode === 'dark';

  const cardBg = isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(0,0,0,0.05)';
  const cardBorder = isDark ? 'rgba(148, 163, 184, 0.3)' : 'rgba(0,0,0,0.1)';

  const renderMovie = useCallback(
    (movie: Movie) => {
      const isFav = favoritesIds.has(movie.id);

      return (
        <View
          key={movie.id}
          style={[
            styles.movieSuggestionCard,
            {backgroundColor: cardBg, borderColor: cardBorder},
          ]}>
          <View style={styles.movieSuggestionInfo}>
            <Text
              style={[styles.movieSuggestionTitle, {color: colors.text}]}
              numberOfLines={1}>
              {movie.title}
            </Text>

            <Text style={[styles.movieSuggestionYear, {color: colors.mutedText}]}>
              {movie.year} • ⭐ {Number(movie.rating).toFixed(1)}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.addToFavButton,
              {
                backgroundColor: isFav
                  ? isDark
                    ? 'rgba(148, 163, 184, 0.3)'
                    : 'rgba(0,0,0,0.1)'
                  : colors.primary,
              },
            ]}
            onPress={() => !isFav && onAddMovie(movie)}
            disabled={isFav}>
            <Text style={[styles.addToFavText, {color: isFav ? colors.mutedText : '#fff'}]}>
              {isFav ? '✓ Added' : '+ Add'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    },
    [favoritesIds, styles, cardBg, cardBorder, colors.text, colors.mutedText, colors.primary, mode, onAddMovie],
  );

  return <View style={styles.movieSuggestions}>{movies.map(renderMovie)}</View>;
}

export default memo(MovieSuggestionsBase);
