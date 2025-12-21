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
import {logError} from '../services/analytics';


export default function TheatresScreen() {
  const theme = useTheme();

  if (!isFeatureEnabled('ENABLE_THEATERS')) {
    return (
      <SafeAreaView
        edges={['top', 'left', 'right']}
        style={[styles.container, {backgroundColor: theme.colors.background}]}>
        <View style={styles.header}>
          <Text style={[styles.title, {color: theme.colors.text}]}>Theaters</Text>
        </View>
        <View style={styles.center}>
          <Text style={[styles.emptyText, {color: theme.colors.mutedText}]}>
            This feature is currently disabled.
          </Text>
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
            title: 'Location Permission',
            message: 'This app needs access to your location to find nearby theaters.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getUserLocation();
        } else {
          Alert.alert('Permission Denied', 'Location permission is required to find nearby theaters.');
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
    console.log('Requesting user location...');
    Geolocation.getCurrentPosition(
      async position => {
        const {latitude, longitude} = position.coords;
        console.log('Got location:', {latitude, longitude});
        try {
          const results = await fetchNearbyTheaters(latitude, longitude);
          setTheaters(results);
          const {logTheaterSearch} = await import('../services/analytics');
          logTheaterSearch('gps', results.length);
        } catch (error: any) {
          const { logError } = await import('../services/analytics');
          logError(error, 'Failed to fetch theaters');
          Alert.alert('Error', error.message || 'Failed to fetch theaters');
        } finally {
          setLoading(false);
        }
      },
      error => {
        setLoading(false);
        logError(error as any, 'Location error');
        Alert.alert('Location Error', `Unable to get your location: ${error.message}`);
      },
      {enableHighAccuracy: true, timeout: 30000, maximumAge: 0}
    );
  };

  const searchByZipCode = async () => {
    if (!zipCode || zipCode.length < 5) {
      Alert.alert('Invalid Zip Code', 'Please enter a valid 5-digit zip code.');
      return;
    }

    setLoading(true);
    try {
      const {lat, lng} = await geocodeZipCode(zipCode);
      console.log('Zip code location:', {lat, lng});
      const results = await fetchNearbyTheaters(lat, lng);
      setTheaters(results);
      const {logTheaterSearch} = await import('../services/analytics');
      logTheaterSearch('zipcode', results.length);
    } catch (error: any) {
      const { logError } = await import('../services/analytics');
      logError(error, 'Failed to find theaters');
      Alert.alert('Error', error.message || 'Failed to find theaters');
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
    const {logTheaterDirections} = await import('../services/analytics');
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
          {item.distance.toFixed(1)} miles away
        </Text>
      </View>
      <Text style={[styles.directionsIcon, {color: theme.colors.primary}]}>→</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={styles.header}>
        <Text style={[styles.title, {color: theme.colors.text}]}>Nearby Theaters</Text>
      </View>

      <View style={styles.searchContainer}>
        <TouchableOpacity
          style={[styles.locationButton, {backgroundColor: theme.colors.primary}]}
          onPress={requestLocationPermission}>
          <Text style={styles.locationButtonText}>📍 Use My Location</Text>
        </TouchableOpacity>
        
        <View style={styles.zipContainer}>
          <TextInput
            style={[styles.zipInput, {backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.mutedText, borderWidth: 1}]}
            placeholder="Enter Zip Code"
            placeholderTextColor={theme.colors.mutedText}
            value={zipCode}
            onChangeText={setZipCode}
            keyboardType="numeric"
            maxLength={5}
          />
          <TouchableOpacity
            style={[styles.zipButton, {backgroundColor: theme.colors.primary}]}
            onPress={searchByZipCode}>
            <Text style={styles.zipButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && theaters.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, {color: theme.colors.mutedText}]}>
            Finding theaters near you...
          </Text>
        </View>
      ) : theaters.length === 0 ? (
        <FlatList
          data={[]}
          renderItem={null}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={[styles.emptyText, {color: theme.colors.mutedText}]}>
                No theaters found. Use location or enter zip code.
              </Text>
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
