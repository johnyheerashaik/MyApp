import React, { useCallback, useRef, useState } from 'react';
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
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Geolocation from '@react-native-community/geolocation';

import { useAppSelector } from '../store/rtkHooks';
import { selectTheme } from '../store/theme/selectors';
import { selectTheaters, selectTheatersLoading, selectTheatersError } from '../store/theatres/selectors';
import { Theater } from '../services/theatersApi';
import { useTheatresActions } from '../store/theatres/hooks';
import { isFeatureEnabled } from '../config/featureToggles';
import styles from './styles';
import { STRINGS } from '../common/strings';
import { logError, logTheaterSearch, logTheaterDirections } from '../services/analytics';

export default function TheatresScreen() {
  const theme = useAppSelector(selectTheme);
  const theaters = useAppSelector(selectTheaters);
  const loading = useAppSelector(selectTheatersLoading);
  const { fetchByCoords, fetchByZip } = useTheatresActions();
  const [zipCode, setZipCode] = useState('');
  const zipInputRef = useRef<TextInput>(null);

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

  const fetchByCoordsLocal = useCallback((latitude: number, longitude: number, source: 'gps' | 'zipcode') => {
    fetchByCoords(latitude, longitude);
    logTheaterSearch(source, theaters.length);
  }, [fetchByCoords, theaters.length]);

  const getUserLocation = useCallback(() => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        fetchByCoordsLocal(latitude, longitude, 'gps');
      },
      error => {
        logError(error as any, 'Location error');
        Alert.alert(STRINGS.LOCATION_ERROR, `${STRINGS.UNABLE_TO_GET_LOCATION}${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 },
    );
  }, [fetchByCoordsLocal]);

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

  const handleSearch = useCallback(() => {
    const zip = zipCode.trim();
    if (zip.length !== 5) {
      Alert.alert(STRINGS.INVALID_ZIP_CODE, STRINGS.ENTER_VALID_ZIP);
      return;
    }
    fetchByZip(zip);
    logTheaterSearch('zipcode', theaters.length);
    Keyboard.dismiss();
    zipInputRef.current?.blur();
  }, [zipCode, fetchByZip, theaters.length]);

  const searchByZipCode = useCallback(() => {
    const zip = zipCode.trim();
    if (zip.length !== 5) {
      Alert.alert(STRINGS.INVALID_ZIP_CODE, STRINGS.ENTER_VALID_ZIP);
      return;
    }
    fetchByZip(zip);
    logTheaterSearch('zipcode', theaters.length);
  }, [zipCode, fetchByZip, theaters.length]);

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
          ref={zipInputRef}
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
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity
          style={[styles.zipButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleSearch}>
          <Text style={styles.zipButtonText}>{STRINGS.SEARCH}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  const renderLoader = () => (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={[styles.emptyText, { color: theme.colors.primary }]}>
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
