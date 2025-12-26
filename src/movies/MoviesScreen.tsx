import React, {useEffect, useState} from 'react';
import {
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {useTheme} from '../theme/ThemeContext';
import {fetchMoviesFromEndpoint, Movie} from '../services/movieApi';
import {useFavorites} from '../favorites/FavoritesContext';
import { STRINGS } from '../common/strings';
import {APP_STRINGS, MOVIE_ENDPOINTS} from '../constants';
import styles from './styles';

const COLLECTIONS = [
  {id: 'marvel', title: '🦸 Marvel Universe', keywordId: 180547, type: 'keyword'},
  {id: 'dc', title: '🦇 DC Comics', keywordId: 312528, type: 'keyword'},
  {id: 'harry_potter', title: '⚡ Harry Potter', collectionId: 1241, type: 'collection'},
  {id: 'star_wars', title: '🌌 Star Wars', collectionId: 10, type: 'collection'},
  {id: 'lord_rings', title: '💍 Lord of the Rings', collectionId: 119, type: 'collection'},
];

const SECTIONS = [
  {key: 'popular', title: APP_STRINGS.POPULAR, endpoint: MOVIE_ENDPOINTS.POPULAR},
  {key: 'now_playing', title: APP_STRINGS.NOW_PLAYING, endpoint: MOVIE_ENDPOINTS.NOW_PLAYING},
  {key: 'upcoming', title: APP_STRINGS.UPCOMING, endpoint: MOVIE_ENDPOINTS.UPCOMING},
  {key: 'top_rated', title: APP_STRINGS.TOP_RATED, endpoint: MOVIE_ENDPOINTS.TOP_RATED},
];

type RowProps = {
  title: string;
  endpoint: string;
  navigation: any;
  searchQuery: string;
};

function MovieRow({title, endpoint, navigation, searchQuery}: RowProps) {
  const theme = useTheme();
  const {isFavorite, toggleFavorite} = useFavorites();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const list = await fetchMoviesFromEndpoint(endpoint);
        setMovies(list);
      } catch (e: any) {
        setError(e?.message || 'Failed to load movies');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [endpoint]);

  const filteredMovies =
    searchQuery.trim().length === 0
      ? movies
      : movies.filter(m =>
          m.title.toLowerCase().includes(searchQuery.toLowerCase()),
        );

  if (loading) {
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
          {title}
        </Text>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
          {title}
        </Text>
        <Text style={{color: theme.colors.danger}}>{error}</Text>
      </View>
    );
  }

  if (filteredMovies.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
        {title}
      </Text>

      <FlatList
        horizontal
        data={filteredMovies}
        keyExtractor={item => String(item.id)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rowContent}
        renderItem={({item}) => {
          const favorite = isFavorite(item.id);

          return (
            <View style={styles.posterWrapper}>
              <View style={styles.posterRelative}>
                <TouchableOpacity
                  style={styles.posterTouchable}
                  onPress={() =>
                    navigation.navigate('MovieDetails', {movieId: item.id})
                  }>
                  {item.poster && (
                    <Image source={{uri: item.poster}} style={styles.poster} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.favoriteBadge,
                    {
                      backgroundColor: theme.colors.overlay,
                    },
                  ]}
                  onPress={() => toggleFavorite(item)}>
                  <Text
                    style={[
                      styles.favoriteIcon,
                      {
                        color: favorite
                          ? theme.colors.primary
                          : theme.colors.white,
                      },
                    ]}>
                    {favorite ? '♥' : '♡'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text
                numberOfLines={1}
                style={[
                  styles.movieTitle,
                  {color: theme.colors.text},
                ]}>
                {item.title}
              </Text>
              <Text
                style={[
                  styles.movieMeta,
                  {color: theme.colors.mutedText},
                ]}>
                {item.year} • ⭐ {item.rating.toFixed(1)}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
}

type ScreenProps = {
  navigation: any;
};

export default function MoviesScreen({navigation}: ScreenProps) {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.screen, {backgroundColor: theme.colors.background}]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[
            styles.backButton,
            {backgroundColor: theme.colors.card},
          ]}
          onPress={() => navigation.goBack()}>
          <Text style={[styles.backIcon, {color: theme.colors.text}]}>
            {'‹'}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.headerTitle, {color: theme.colors.text}]}>
          {APP_STRINGS.MOVIES}
        </Text>

        <View style={{width: 32 /* Use SPACING or ICON_SIZE if appropriate */}} />
      </View>

      {/* SEARCH */}
      <View
        style={[
          styles.searchWrapper,
          {backgroundColor: theme.colors.inputBackground},
        ]}>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={STRINGS.SEARCH_MOVIES}
          placeholderTextColor={theme.colors.mutedText}
          style={[styles.searchInput, {color: theme.colors.text}]}
          returnKeyType="search"
        />
      </View>

      {/* LIST SECTIONS */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
            🎬 Collections
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rowContent}>
            {COLLECTIONS.map(collection => (
              <TouchableOpacity
                key={collection.id}
                style={[styles.collectionCard, {backgroundColor: theme.colors.card}]}
                onPress={() => navigation.navigate('Collection', {
                  title: collection.title,
                  collectionId: collection.type === 'collection' ? collection.collectionId : undefined,
                  keywordId: collection.type === 'keyword' ? collection.keywordId : undefined,
                })}>
                <Text style={[styles.collectionTitle, {color: theme.colors.text}]}>
                  {collection.title}
                </Text>
                <Text style={[styles.collectionSubtitle, {color: theme.colors.mutedText}]}>
                  Tap to explore →
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {SECTIONS.map(section => (
          <MovieRow
            key={section.key}
            title={section.title}
            endpoint={section.endpoint}
            navigation={navigation}
            searchQuery={searchQuery}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
