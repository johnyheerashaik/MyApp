import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from '../theme/ThemeContext';
import {getMovieDetails, MovieDetails} from '../services/movieApi';
import {APP_STRINGS} from '../constants';
import styles from './styles';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/types';

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
      style={[styles.screen, {backgroundColor: colors.background}]}>
      <ActivityIndicator />
    </SafeAreaView>
  );
}

function renderErrorState(colors: ThemeColors, error: string) {
  return (
    <SafeAreaView
      style={[styles.screen, {backgroundColor: colors.background}]}>
      <Text style={{color: colors.danger}}>{error || APP_STRINGS.NO_DATA}</Text>
    </SafeAreaView>
  );
}

function renderHeader(colors: ThemeColors, title: string, onBack: () => void) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}>
        <Text style={[styles.backIcon, {color: colors.text}]}>{'‹'}</Text>
      </TouchableOpacity>
      <Text style={[styles.headerTitle, {color: colors.text}]}>
        {title}
      </Text>
      <View style={{width: 32}} />
    </View>
  );
}

function renderTopRow(movie: MovieDetails, colors: ThemeColors) {
  return (
    <View style={styles.topRow}>
      {movie.poster && (
        <Image source={{uri: movie.poster}} style={styles.poster} />
      )}
      <View style={styles.info}>
        <Text
          style={[styles.title, {color: colors.text}]}
          numberOfLines={2}>
          {movie.title}
        </Text>
        <Text
          style={[styles.meta, {color: colors.mutedText}]}
          numberOfLines={1}>
          {movie.year} • ⭐ {movie.rating.toFixed(1)}
        </Text>
        {movie.runtime && (
          <Text style={[styles.meta, {color: colors.mutedText}]}>
            {movie.runtime} min
          </Text>
        )}
        {!!movie.genres.length && (
          <Text
            style={[styles.meta, {color: colors.mutedText}]}
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
      <Text style={[styles.sectionTitle, {color: colors.text}]}>
        {APP_STRINGS.OVERVIEW}
      </Text>
      <Text style={[styles.overview, {color: colors.mutedText}]}>
        {movie.overview || APP_STRINGS.NO_OVERVIEW_AVAILABLE}
      </Text>
    </View>
  );
}

function renderCastMember(
  member: {id: number; name: string; character: string; profilePath: string | null},
  colors: ThemeColors,
) {
  return (
    <View key={member.id} style={styles.castRow}>
      {member.profilePath && (
        <Image
          source={{uri: member.profilePath}}
          style={styles.castAvatar}
        />
      )}
      <View style={styles.castInfo}>
        <Text
          style={[styles.castName, {color: colors.text}]}
          numberOfLines={1}>
          {member.name}
        </Text>
        <Text
          style={[styles.castCharacter, {color: colors.mutedText}]}
          numberOfLines={1}>
          {APP_STRINGS.AS} {member.character}
        </Text>
      </View>
    </View>
  );
}

function renderCastSection(movie: MovieDetails, colors: ThemeColors) {
  if (!movie.cast.length) return null;

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, {color: colors.text}]}>
        {APP_STRINGS.CAST}
      </Text>
      {movie.cast.map(member => renderCastMember(member, colors))}
    </View>
  );
}

export default function MovieDetailsScreen({route, navigation}: MovieDetailsScreenProps) {
  const {movieId} = route.params;
  const theme = useTheme();

  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const details = await getMovieDetails(movieId);
        setMovie(details);
      } catch (e: any) {
        setError(e?.message || 'Failed to load movie');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [movieId]);

  if (loading) {
    return renderLoadingState(theme.colors);
  }

  if (error || !movie) {
    return renderErrorState(theme.colors, error);
  }

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.screen, {backgroundColor: theme.colors.background}]}>
      {renderHeader(theme.colors, movie.title, () => navigation.goBack())}

      <ScrollView showsVerticalScrollIndicator={false}>
        {renderTopRow(movie, theme.colors)}
        {renderOverviewSection(movie, theme.colors)}
        {renderCastSection(movie, theme.colors)}
      </ScrollView>
    </SafeAreaView>
  );
}

