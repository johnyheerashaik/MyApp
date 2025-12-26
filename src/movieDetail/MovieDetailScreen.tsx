import React, {useEffect, useState, useCallback, useMemo} from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {useTheme} from '../theme/ThemeContext';
import {getMovieDetails, getMovieTrailer, MovieDetails} from '../services/movieApi';
import {STRINGS} from '../common/strings';
import styles from './styles';
import type {RootStackParamList} from '../navigation/types';
import {useFavorites} from '../favorites/FavoritesContext';
import TrailerPlayer from './TrailerPlayer';
import StreamingProviders from '../streaming/StreamingProviders';
import {logMovieView, logError} from '../services/analytics';
import {trackOperation} from '../services/performance';

type MovieDetailsScreenProps =
  NativeStackScreenProps<RootStackParamList, 'MovieDetails'>;

const renderLoadingState = (colors: any) => (
  <SafeAreaView style={[styles.screen, {backgroundColor: colors.background}]}>
    <ActivityIndicator />
  </SafeAreaView>
);

const renderErrorState = (colors: any, error: string) => (
  <SafeAreaView style={[styles.screen, {backgroundColor: colors.background}]}>
    <Text style={{color: colors.danger}}>
      {error || STRINGS.NO_DATA}
    </Text>
  </SafeAreaView>
);

const renderHeader = (
  colors: any,
  title: string,
  onBack: () => void,
) => (
  <View style={styles.header}>
    <TouchableOpacity style={styles.backButton} onPress={onBack}>
      <Text style={[styles.backIcon, {color: colors.text}]}>{'‹'}</Text>
    </TouchableOpacity>

    <Text style={[styles.headerTitle, {color: colors.text}]}>
      {title}
    </Text>

    <View style={{width: 32}} />
  </View>
);

const renderTopRow = (movie: MovieDetails, colors: any) => {
  const hasPoster = Boolean(movie.poster);
  const hasRuntime = Boolean(movie.runtime);
  const hasGenres = movie.genres.length > 0;

  return (
    <View style={styles.topRow}>
      {hasPoster && (
        <Image source={{uri: movie.poster!}} style={styles.poster} />
      )}

      <View style={styles.info}>
        <Text style={[styles.title, {color: colors.text}]} numberOfLines={2}>
          {movie.title}
        </Text>

        <Text style={[styles.meta, {color: colors.mutedText}]}>
          {movie.year} • ⭐ {movie.rating.toFixed(1)}
        </Text>

        {hasRuntime && (
          <Text style={[styles.meta, {color: colors.mutedText}]}>
            {movie.runtime} min
          </Text>
        )}

        {hasGenres && (
          <Text
            style={[styles.meta, {color: colors.mutedText}]}
            numberOfLines={2}>
            {movie.genres.join(' • ')}
          </Text>
        )}
      </View>
    </View>
  );
};

const renderOverviewSection = (movie: MovieDetails, colors: any) => (
  <View style={styles.section}>
    <Text style={[styles.sectionTitle, {color: colors.text}]}>
      {STRINGS.OVERVIEW}
    </Text>
    <Text style={[styles.overview, {color: colors.mutedText}]}>
      {movie.overview || STRINGS.NO_OVERVIEW_AVAILABLE}
    </Text>
  </View>
);

const renderCastSection = (movie: MovieDetails, colors: any) => {
  if (movie.cast.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, {color: colors.text}]}>
        {STRINGS.CAST}
      </Text>

      {movie.cast.map(member => (
        <View key={member.id} style={styles.castRow}>
          {member.profilePath && (
            <Image
              source={{uri: member.profilePath}}
              style={styles.castAvatar}
            />
          )}

          <View style={styles.castInfo}>
            <Text style={[styles.castName, {color: colors.text}]} numberOfLines={1}>
              {member.name}
            </Text>
            <Text style={[styles.castCharacter, {color: colors.mutedText}]} numberOfLines={1}>
              {STRINGS.AS} {member.character}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

export default function MovieDetailsScreen({route, navigation}: MovieDetailsScreenProps) {
  const {movieId} = route.params;
  const theme = useTheme();
  const {isReminderEnabled, toggleReminder} = useFavorites();

  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [togglingReminder, setTogglingReminder] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);

  const reminderOn = isReminderEnabled(movieId);

  useEffect(() => {
    const load = async () => {
      try {
        const [details, trailer] = await trackOperation(
          'load_movie_details',
          () =>
            Promise.all([
              getMovieDetails(movieId),
              getMovieTrailer(movieId),
            ]),
        );

        setMovie(details);
        setTrailerKey(trailer);
        logMovieView(movieId.toString(), details.title);
      } catch (e: any) {
        setError(e?.message || STRINGS.FAILED_TO_LOAD);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [movieId]);

  const handleToggleReminder = useCallback(async () => {
    if (!movie?.releaseDate) {
      Alert.alert(
        STRINGS.NO_RELEASE_DATE,
        STRINGS.NO_RELEASE_DATE_AVAILABLE,
      );
      return;
    }

    const nextState = !reminderOn;
    setTogglingReminder(true);

    try {
      await toggleReminder(movieId, nextState);
    } catch (e) {
      logError(e as any, STRINGS.REMINDER_ERROR);
      Alert.alert(STRINGS.ERROR, STRINGS.REMINDER_ERROR);
    } finally {
      setTogglingReminder(false);
    }
  }, [movie, reminderOn, movieId, toggleReminder]);

  const reminderLabel = useMemo(() => {
    if (togglingReminder) return '...';
    return reminderOn ? STRINGS.REMINDER_ENABLED : STRINGS.REMIND_ME;
  }, [togglingReminder, reminderOn]);

  if (loading) return renderLoadingState(theme.colors);
  if (error || !movie) return renderErrorState(theme.colors, error);

  const hasTrailer = Boolean(trailerKey);

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.screen, {backgroundColor: theme.colors.background}]}>
      {renderHeader(theme.colors, movie.title, navigation.goBack)}

      <ScrollView showsVerticalScrollIndicator={false}>
        {renderTopRow(movie, theme.colors)}

        <View style={styles.reminderSection}>
          <TouchableOpacity
            style={[
              styles.reminderButton,
              {
                backgroundColor: reminderOn
                  ? theme.colors.primary
                  : theme.colors.card,
                borderColor: theme.colors.primary,
                opacity: togglingReminder ? 0.7 : 1,
              },
            ]}
            onPress={handleToggleReminder}
            disabled={togglingReminder}>
            <Text
              style={[
                styles.reminderButtonText,
                {
                  color: reminderOn
                    ? theme.colors.white
                    : theme.colors.primary,
                },
              ]}>
              {reminderLabel}
            </Text>
          </TouchableOpacity>
        </View>

        <StreamingProviders movieId={movieId} />

        {hasTrailer && (
          <TrailerPlayer
            trailerKey={trailerKey!}
            textColor={theme.colors.text}
          />
        )}

        {renderOverviewSection(movie, theme.colors)}
        {renderCastSection(movie, theme.colors)}
      </ScrollView>
    </SafeAreaView>
  );
}
