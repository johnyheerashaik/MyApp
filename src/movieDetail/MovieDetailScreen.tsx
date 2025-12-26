import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { getMovieDetails, getMovieTrailer, MovieDetails } from '../services/movieApi';
import { STRINGS } from '../common/strings';
import styles from './styles';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useFavorites } from '../favorites/FavoritesContext';
import TrailerPlayer from './TrailerPlayer';
import StreamingProviders from '../streaming/StreamingProviders';
import { logMovieView } from '../services/analytics';
import { logError } from '../services/analytics';
import { trackOperation } from '../services/performance';

type MovieDetailsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'MovieDetails'
>;

type ThemeColors = {
  background: string;
  text: string;
  mutedText: string;
  primary: string;
  card: string;
  inputBackground: string;
  danger: string;
};

function renderLoadingState(colors: ThemeColors) {
  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}>
      <ActivityIndicator />
    </SafeAreaView>
  );
}

function renderErrorState(colors: ThemeColors, error: string) {
  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}>
      <Text style={{ color: colors.danger }}>{error || STRINGS.NO_DATA}</Text>
    </SafeAreaView>
  );
}

function renderHeader(colors: ThemeColors, title: string, onBack: () => void) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}>
        <Text style={[styles.backIcon, { color: colors.text }]}>{'‹'}</Text>
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: colors.text }]}>
        {title}
      </Text>
      <View style={{ width: 32 }} />
    </View>
  );
}

function renderTopRow(movie: MovieDetails, colors: ThemeColors) {
  return (
    <View style={styles.topRow}>
      {movie.poster && (
        <Image source={{ uri: movie.poster }} style={styles.poster} />
      )}
      <View style={styles.info}>
        <Text
          style={[styles.title, { color: colors.text }]}
          numberOfLines={2}>
          {movie.title}
        </Text>
        <Text
          style={[styles.meta, { color: colors.mutedText }]}
          numberOfLines={1}>
          {movie.year} • ⭐ {movie.rating.toFixed(1)}
        </Text>
        {movie.runtime && (
          <Text style={[styles.meta, { color: colors.mutedText }]}>
            {movie.runtime} min
          </Text>
        )}
        {!!movie.genres.length && (
          <Text
            style={[styles.meta, { color: colors.mutedText }]}
            numberOfLines={2}>
            {movie.genres.join(' • ')}
          </Text>
        )}
      </View>
    </View>
  );
}

function renderOverviewSection(movie: MovieDetails, colors: ThemeColors) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {STRINGS.OVERVIEW}
      </Text>
      <Text style={[styles.overview, { color: colors.mutedText }]}>
        {movie.overview || STRINGS.NO_OVERVIEW_AVAILABLE}
      </Text>
    </View>
  );
}

function renderCastMember(
  member: { id: number; name: string; character: string; profilePath: string | null },
  colors: ThemeColors,
) {
  return (
    <View key={member.id} style={styles.castRow}>
      {member.profilePath && (
        <Image
          source={{ uri: member.profilePath }}
          style={styles.castAvatar}
        />
      )}
      <View style={styles.castInfo}>
        <Text
          style={[styles.castName, { color: colors.text }]}
          numberOfLines={1}>
          {member.name}
        </Text>
        <Text
          style={[styles.castCharacter, { color: colors.mutedText }]}
          numberOfLines={1}>
          {STRINGS.AS} {member.character}
        </Text>
      </View>
    </View>
  );
}

function renderCastSection(movie: MovieDetails, colors: ThemeColors) {
  if (!movie.cast.length) return null;

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {STRINGS.CAST}
      </Text>
      {movie.cast.map(member => renderCastMember(member, colors))}
    </View>
  );
}

export default function MovieDetailsScreen({ route, navigation }: MovieDetailsScreenProps) {
  const { movieId } = route.params;
  const theme = useTheme();
  const { isFavorite, isReminderEnabled, toggleReminder } = useFavorites();

  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [togglingReminder, setTogglingReminder] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);

  const favorited = isFavorite(movieId);
  const reminderOn = isReminderEnabled(movieId);

  useEffect(() => {
    const load = async () => {
      try {
        const [details, trailer] = await trackOperation('load_movie_details_screen', async () => {
          return Promise.all([
            getMovieDetails(movieId),
            getMovieTrailer(movieId),
          ]);
        });
        setMovie(details);
        setTrailerKey(trailer);
        logMovieView(movieId.toString(), details.title);
      } catch (e: any) {
        setError(e?.message || 'Failed to load movie');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [movieId]);

  const handleToggleReminder = async () => {
    if (!movie?.releaseDate) {
      Alert.alert(
        STRINGS.NO_RELEASE_DATE,
        STRINGS.NO_RELEASE_DATE_AVAILABLE,
        [{ text: STRINGS.OK }]
      );
      return;
    }

    const newState = !reminderOn;

    if (newState) {
      Alert.alert(
        STRINGS.ENABLE_REMINDER,
        STRINGS.GET_NOTIFIED.replace('{TITLE}', movie.title).replace('{DATE}', movie.releaseDate),
        [
          { text: STRINGS.CANCEL, style: 'cancel' },
          {
            text: STRINGS.ENABLE,
            onPress: async () => {
              setTogglingReminder(true);
              try {
                await toggleReminder(movieId, true);
              } catch (error) {
                logError(error as any, STRINGS.FAILED_TO_ENABLE_REMINDER);
                Alert.alert(STRINGS.ERROR, STRINGS.FAILED_TO_ENABLE_REMINDER);
              } finally {
                setTogglingReminder(false);
              }
            },
          },
        ]
      );
    } else {
      setTogglingReminder(true);
      try {
        await toggleReminder(movieId, false);
      } catch (error) {
        logError(error as any, STRINGS.FAILED_TO_DISABLE_REMINDER);
        Alert.alert(STRINGS.ERROR, STRINGS.FAILED_TO_DISABLE_REMINDER);
      } finally {
        setTogglingReminder(false);
      }
    }
  };

  const isStrictlyFutureRelease = (releaseDate?: string | null) => {
    if (!releaseDate) return false;

    // TMDB format: "YYYY-MM-DD"
    const match = releaseDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return false;

    const y = Number(match[1]);
    const m = Number(match[2]) - 1;
    const d = Number(match[3]);

    const release = new Date(y, m, d);
    release.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return release > today; // future only (NOT today)
  };



  const renderReminderButton = () => {
    const releaseDate = movie?.releaseDate;

    // Show only for valid future releases
    if (!releaseDate) return null;
    const releaseDateObj = new Date(releaseDate);
    const now = new Date();
    const isValidDate = typeof releaseDate === 'string' && !isNaN(releaseDateObj.getTime());
    const isPast = isValidDate ? releaseDateObj < now : true;
    if (!isValidDate || isPast) return null;

    return (
      <View style={styles.reminderSection}>
        <TouchableOpacity
          style={[
            styles.reminderButton,
            {
              backgroundColor: reminderOn ? theme.colors.primary : theme.colors.card,
              borderColor: theme.colors.primary,
              opacity: togglingReminder ? 0.7 : 1,
            },
          ]}
          onPress={handleToggleReminder}
          disabled={togglingReminder}
        >
          <Text
            style={[
              styles.reminderButtonText,
              { color: reminderOn ? theme.colors.white : theme.colors.primary },
            ]}
          >
            {togglingReminder
              ? '...'
              : reminderOn
                ? STRINGS.REMINDER_ENABLED
                : STRINGS.REMIND_ME}
          </Text>
        </TouchableOpacity>

        {reminderOn && (
          <Text style={[styles.reminderSubtext, { color: theme.colors.mutedText }]}>
            {STRINGS.NOTIFY_ONE_DAY_BEFORE}
          </Text>
        )}
      </View>
    );
  };

  if (loading) {
    return renderLoadingState(theme.colors);
  }

  if (error || !movie) {
    return renderErrorState(theme.colors, error);
  }

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      {renderHeader(theme.colors, movie.title, () => navigation.goBack())}

      <ScrollView showsVerticalScrollIndicator={false}>
        {renderTopRow(movie, theme.colors)}
        {renderReminderButton()}
        <StreamingProviders movieId={movieId} />
        {trailerKey && <TrailerPlayer trailerKey={trailerKey} textColor={theme.colors.text} />}
        {renderOverviewSection(movie, theme.colors)}
        {renderCastSection(movie, theme.colors)}
      </ScrollView>
    </SafeAreaView>
  );
}

