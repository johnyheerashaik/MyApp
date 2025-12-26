import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  Linking,
  PermissionsAndroid,
  Platform,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Geolocation from '@react-native-community/geolocation';

import { useTheme } from '../theme/ThemeContext';
import { fetchNearbyTheaters, geocodeZipCode, Theater } from '../services/theatersApi';
import { isFeatureEnabled } from '../config/featureToggles';
import styles from './styles';
import { STRINGS } from '../common/strings';
import { logError, logTheaterSearch, logTheaterDirections } from '../services/analytics';

export default function TheatresScreen() {
  const theme = useTheme();

  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [loading, setLoading] = useState(false);
  const [zipCode, setZipCode] = useState('');

  const openInMaps = useCallback(async (theater: Theater) => {
    try {
      logTheaterDirections(theater.name);

      const url = Platform.select({
        ios: `maps://app?daddr=${theater.latitude},${theater.longitude}`,
        android: `google.navigation:q=${theater.latitude},${theater.longitude}`,
      });

      if (!url) return;

      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        Alert.alert(STRINGS.ERROR, STRINGS.UNABLE_TO_OPEN_MAPS);
        return;
      }

      Linking.openURL(url);
    } catch (e: any) {
      logError(e, 'Open maps failed');
      Alert.alert(STRINGS.ERROR, STRINGS.UNABLE_TO_OPEN_MAPS);
    }
  }, []);

  const fetchByCoords = useCallback(async (latitude: number, longitude: number, source: 'gps' | 'zipcode') => {
    setLoading(true);
    try {
      const results = await fetchNearbyTheaters(latitude, longitude);
      setTheaters(results);
      logTheaterSearch(source, results.length);
    } catch (error: any) {
      logError(error, 'Failed to fetch theaters');
      Alert.alert(STRINGS.ERROR, error?.message || STRINGS.FAILED_TO_FIND_THEATERS);
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserLocation = useCallback(() => {
    setLoading(true);

    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        fetchByCoords(latitude, longitude, 'gps');
      },
      error => {
        setLoading(false);
        logError(error as any, 'Location error');
        Alert.alert(STRINGS.LOCATION_ERROR, `${STRINGS.UNABLE_TO_GET_LOCATION}${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 },
    );
  }, [fetchByCoords]);

  const requestLocationPermission = useCallback(async () => {
    if (Platform.OS !== 'android') {
      getUserLocation();
      return;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: STRINGS.LOCATION_PERMISSION_TITLE,
          message: STRINGS.LOCATION_PERMISSION_MESSAGE,
          buttonNeutral: STRINGS.LOCATION_PERMISSION_NEUTRAL,
          buttonNegative: STRINGS.LOCATION_PERMISSION_NEGATIVE,
          buttonPositive: STRINGS.LOCATION_PERMISSION_POSITIVE,
        },
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        getUserLocation();
      } else {
        Alert.alert(STRINGS.PERMISSION_DENIED, STRINGS.LOCATION_PERMISSION_REQUIRED);
      }
    } catch (err: any) {
      logError(err, 'Permission request failed');
      Alert.alert(STRINGS.ERROR, STRINGS.SOMETHING_WENT_WRONG);
    }
  }, [getUserLocation]);

  const searchByZipCode = useCallback(async () => {
    const zip = zipCode.trim();

    if (zip.length !== 5) {
      Alert.alert(STRINGS.INVALID_ZIP_CODE, STRINGS.ENTER_VALID_ZIP);
      return;
    }

    setLoading(true);
    try {
      const { lat, lng } = await geocodeZipCode(zip);
      await fetchByCoords(lat, lng, 'zipcode');
    } catch (error: any) {
      logError(error, 'Failed to find theaters by zip');
      Alert.alert(STRINGS.ERROR, error?.message || STRINGS.FAILED_TO_FIND_THEATERS);
    } finally {
      setLoading(false);
    }
  }, [zipCode, fetchByCoords]);

  const handleRefresh = useCallback(() => {
    const zip = zipCode.trim();
    if (zip.length === 5) {
      searchByZipCode();
    } else {
      requestLocationPermission();
    }
  }, [zipCode, searchByZipCode, requestLocationPermission]);

  const renderTheater = useCallback(
    ({ item }: { item: Theater }) => (
      <TouchableOpacity
        style={[styles.theaterCard, { backgroundColor: theme.colors.card }]}
        onPress={() => openInMaps(item)}>
        <View style={styles.theaterInfo}>
          <Text style={[styles.theaterName, { color: theme.colors.text }]}>{item.name}</Text>

          <Text style={[styles.theaterAddress, { color: theme.colors.mutedText }]}>
            {item.address}
          </Text>

          <Text style={[styles.theaterDistance, { color: theme.colors.primary }]}>
            {item.distance.toFixed(1)} {STRINGS.MILES_AWAY}
          </Text>
        </View>

        <Text style={[styles.directionsIcon, { color: theme.colors.primary }]}>
          {STRINGS.ARROW}
        </Text>
      </TouchableOpacity>
    ),
    [openInMaps, theme.colors.card, theme.colors.mutedText, theme.colors.primary, theme.colors.text],
  );


  const isShowInitialLoader = useCallback(() => {
    return loading && theaters.length === 0;
  }, [loading, theaters]);

  const isShowEmptyState = useCallback(() => {
    return !loading && theaters.length === 0;
  }, [loading, theaters]);

  if (!isFeatureEnabled('ENABLE_THEATERS')) {
    return (
      <SafeAreaView
        edges={['top', 'left', 'right']}
        style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{STRINGS.THEATERS}</Text>
        </View>
        <View style={styles.center}>
          <Text style={[styles.emptyText, { color: theme.colors.mutedText }]}>
            {STRINGS.FEATURE_DISABLED}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderSearchSection = () => (
    <View style={styles.searchContainer}>
      <TouchableOpacity
        style={[styles.locationButton, { backgroundColor: theme.colors.primary }]}
        onPress={requestLocationPermission}>
        <Text style={styles.locationButtonText}>{STRINGS.USE_MY_LOCATION}</Text>
      </TouchableOpacity>
      <View style={styles.zipContainer}>
        <TextInput
          style={[
            styles.zipInput,
            {
              backgroundColor: theme.colors.card,
              color: theme.colors.text,
              borderColor: theme.colors.mutedText,
              borderWidth: 1,
            },
          ]}
          placeholder={STRINGS.ENTER_ZIP_CODE}
          placeholderTextColor={theme.colors.mutedText}
          value={zipCode}
          onChangeText={setZipCode}
          keyboardType="numeric"
          maxLength={5}
          returnKeyType="search"
          onSubmitEditing={searchByZipCode}
        />
        <TouchableOpacity
          style={[styles.zipButton, { backgroundColor: theme.colors.primary }]}
          onPress={searchByZipCode}>
          <Text style={styles.zipButtonText}>{STRINGS.SEARCH}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLoader = () => (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={[styles.loadingText, { color: theme.colors.mutedText }]}>
        {STRINGS.FINDING_THEATERS}
      </Text>
    </View>
  );

  const renderTheaterList = () => (
    <FlatList
      data={theaters}
      renderItem={renderTheater}
      keyExtractor={item => item.id}
      contentContainerStyle={[
        styles.list,
        isShowEmptyState() ? { flex: 1 } : null,
      ]}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        isShowEmptyState() ? (
          <View style={styles.center}>
            <Text style={[styles.emptyText, { color: theme.colors.mutedText }]}>
              {STRINGS.NO_THEATERS_FOUND}
            </Text>
          </View>
        ) : null
      }
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={handleRefresh}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary]}
        />
      }
    />
  );

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {STRINGS.NEARBY_THEATERS}
        </Text>
      </View>
      {renderSearchSection()}
      {isShowInitialLoader() ? renderLoader() : renderTheaterList()}
    </SafeAreaView>
  );
}
