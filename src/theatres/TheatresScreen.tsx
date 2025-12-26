import React, {useState} from 'react';
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
import {SafeAreaView} from 'react-native-safe-area-context';
import Geolocation from '@react-native-community/geolocation';
import {useTheme} from '../theme/ThemeContext';
import {fetchNearbyTheaters, geocodeZipCode, Theater} from '../services/theatersApi';
import {isFeatureEnabled} from '../config/featureToggles';
import styles from './styles';
import { STRINGS } from '../common/strings';
import {logError, logTheaterSearch, logTheaterDirections} from '../services/analytics';


export default function TheatresScreen() {
  const theme = useTheme();

  if (!isFeatureEnabled('ENABLE_THEATERS')) {
    return (
      <SafeAreaView
        edges={['top', 'left', 'right']}
        style={[styles.container, {backgroundColor: theme.colors.background}]}>
        <View style={styles.header}>
          <Text style={[styles.title, {color: theme.colors.text}]}>{STRINGS.THEATERS}</Text>
        </View>
        <View style={styles.center}>
          <Text style={[styles.emptyText, {color: theme.colors.mutedText}]}>{STRINGS.FEATURE_DISABLED}</Text>
        </View>
      </SafeAreaView>
    );
  }
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [loading, setLoading] = useState(false);
  const [zipCode, setZipCode] = useState('');

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: STRINGS.LOCATION_PERMISSION_TITLE,
            message: STRINGS.LOCATION_PERMISSION_MESSAGE,
            buttonNeutral: STRINGS.LOCATION_PERMISSION_NEUTRAL,
            buttonNegative: STRINGS.LOCATION_PERMISSION_NEGATIVE,
            buttonPositive: STRINGS.LOCATION_PERMISSION_POSITIVE,
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getUserLocation();
        } else {
          Alert.alert(STRINGS.PERMISSION_DENIED, STRINGS.LOCATION_PERMISSION_REQUIRED);
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      getUserLocation();
    }
  };

  const getUserLocation = () => {
    setLoading(true);
    Geolocation.getCurrentPosition(
      async position => {
        const {latitude, longitude} = position.coords;
        try {
          const results = await fetchNearbyTheaters(latitude, longitude);
          setTheaters(results);
          logTheaterSearch('gps', results.length);
        } catch (error: any) {
          logError(error, 'Failed to fetch theaters');
          Alert.alert(STRINGS.ERROR, error.message || STRINGS.FAILED_TO_FIND_THEATERS);
        } finally {
          setLoading(false);
        }
      },
      error => {
        setLoading(false);
        logError(error as any, 'Location error');
        Alert.alert(STRINGS.LOCATION_ERROR, `${STRINGS.UNABLE_TO_GET_LOCATION}${error.message}`);
      },
      {enableHighAccuracy: true, timeout: 30000, maximumAge: 0}
    );
  };

  const searchByZipCode = async () => {
    if (!zipCode || zipCode.length < 5) {
      Alert.alert(STRINGS.INVALID_ZIP_CODE, STRINGS.ENTER_VALID_ZIP);
      return;
    }

    setLoading(true);
    try {
      const {lat, lng} = await geocodeZipCode(zipCode);
      const results = await fetchNearbyTheaters(lat, lng);
      setTheaters(results);
      logTheaterSearch('zipcode', results.length);
    } catch (error: any) {
      logError(error, 'Failed to find theaters');
      Alert.alert(STRINGS.ERROR, error.message || STRINGS.FAILED_TO_FIND_THEATERS);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (zipCode && zipCode.length === 5) {
      searchByZipCode();
    } else {
      requestLocationPermission();
    }
  };

  const openInMaps = async (theater: Theater) => {
    logTheaterDirections(theater.name);
    const url = Platform.select({
      ios: `maps://app?daddr=${theater.latitude},${theater.longitude}`,
      android: `google.navigation:q=${theater.latitude},${theater.longitude}`,
    });
    if (url) {
      Linking.openURL(url);
    }
  };

  const renderTheater = ({item}: {item: Theater}) => (
    <TouchableOpacity
      style={[styles.theaterCard, {backgroundColor: theme.colors.card}]}
      onPress={() => openInMaps(item)}>
      <View style={styles.theaterInfo}>
        <Text style={[styles.theaterName, {color: theme.colors.text}]}>{item.name}</Text>
        <Text style={[styles.theaterAddress, {color: theme.colors.mutedText}]}>
          {item.address}
        </Text>
        <Text style={[styles.theaterDistance, {color: theme.colors.primary}]}>
    {item.distance.toFixed(1)} {STRINGS.MILES_AWAY}
  </Text>
          <Text style={[styles.theaterDistance, {color: theme.colors.primary}]}>\n          {item.distance.toFixed(1)} {STRINGS.MILES_AWAY}\n        </Text>
      </View>
      <Text style={[styles.directionsIcon, {color: theme.colors.primary}]}>{STRINGS.ARROW}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={styles.header}>
        <Text style={[styles.title, {color: theme.colors.text}]}>{STRINGS.NEARBY_THEATERS}</Text>
      </View>

      <View style={styles.searchContainer}>
        <TouchableOpacity
          style={[styles.locationButton, {backgroundColor: theme.colors.primary}]}
          onPress={requestLocationPermission}>
          <Text style={styles.locationButtonText}>{STRINGS.USE_MY_LOCATION}</Text>
        </TouchableOpacity>
        
        <View style={styles.zipContainer}>
          <TextInput
            style={[styles.zipInput, {backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.mutedText, borderWidth: 1}]}
            placeholder={STRINGS.ENTER_ZIP_CODE}
            placeholderTextColor={theme.colors.mutedText}
            value={zipCode}
            onChangeText={setZipCode}
            keyboardType="numeric"
            maxLength={5}
          />
          <TouchableOpacity
            style={[styles.zipButton, {backgroundColor: theme.colors.primary}]}
            onPress={searchByZipCode}>
            <Text style={styles.zipButtonText}>{STRINGS.SEARCH}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && theaters.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, {color: theme.colors.mutedText}]}>{STRINGS.FINDING_THEATERS}</Text>
        </View>
      ) : theaters.length === 0 ? (
        <FlatList
          data={[]}
          renderItem={null}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={[styles.emptyText, {color: theme.colors.mutedText}]}>{STRINGS.NO_THEATERS_FOUND}</Text>
            </View>
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
      ) : (
        <FlatList
          data={theaters}
          renderItem={renderTheater}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
