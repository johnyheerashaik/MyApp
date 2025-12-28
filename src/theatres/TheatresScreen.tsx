import React, { useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheatres, useTheatresActions } from '../store/theatres/hooks';
import { selectTheme } from '../store/theme/selectors';
import { useAppSelector } from '../store/rtkHooks';

import { isFeatureEnabled } from '../config/featureToggles';
import styles from './styles';
import { STRINGS } from '../common/strings';
import type { Theater } from '../services/theatersApi';

import { useOpenInMaps } from './hooks/useOpenInMaps';
import { useLocationFetch } from './hooks/useLocationFetch';
import { useTheatreSearch } from './hooks/useTheatreSearch';

export default function TheatresScreen() {
  const theme = useAppSelector(selectTheme);

  const { theaters, loading } = useTheatres();
  const { fetchByCoords, fetchByZip } = useTheatresActions();

  const openInMaps = useOpenInMaps();

  const { requestLocationPermission } = useLocationFetch({
    fetchByCoords,
    getTheaterCount: () => theaters.length,
  });

  const { zipCode, setZipCode, zipInputRef, handleSearch, handleRefresh } =
    useTheatreSearch({
      fetchByZip,
      requestLocationPermission,
      getTheaterCount: () => theaters.length,
    });

  const isShowInitialLoader = useCallback(() => loading && theaters.length === 0, [loading, theaters.length]);
  const isShowEmptyState = useCallback(() => !loading && theaters.length === 0, [loading, theaters.length]);

  const renderTheater = useCallback(
    ({ item }: { item: Theater }) => (
      <TouchableOpacity
        style={[styles.theaterCard, { backgroundColor: theme.colors.card }]}
        onPress={() => openInMaps(item)}>
        <View style={styles.theaterInfo}>
          <Text style={[styles.theaterName, { color: theme.colors.text }]}>{item.name}</Text>
          <Text style={[styles.theaterAddress, { color: theme.colors.mutedText }]}>{item.address}</Text>
          <Text style={[styles.theaterDistance, { color: theme.colors.primary }]}>
            {item.distance.toFixed(1)} {STRINGS.MILES_AWAY}
          </Text>
        </View>
        <Text style={[styles.directionsIcon, { color: theme.colors.primary }]}>{STRINGS.ARROW}</Text>
      </TouchableOpacity>
    ),
    [openInMaps, theme.colors.card, theme.colors.mutedText, theme.colors.primary, theme.colors.text],
  );

  if (!isFeatureEnabled('ENABLE_THEATERS')) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{STRINGS.THEATERS}</Text>
        </View>
        <View style={styles.center}>
          <Text style={[styles.emptyText, { color: theme.colors.mutedText }]}>{STRINGS.FEATURE_DISABLED}</Text>
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
        <TouchableOpacity style={[styles.zipButton, { backgroundColor: theme.colors.primary }]} onPress={handleSearch}>
          <Text style={styles.zipButtonText}>{STRINGS.SEARCH}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLoader = () => (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={[styles.emptyText, { color: theme.colors.primary }]}>{STRINGS.FINDING_THEATERS}</Text>
    </View>
  );

  const renderTheaterList = () => (
    <FlatList
      data={theaters}
      renderItem={renderTheater}
      keyExtractor={item => item.id}
      contentContainerStyle={[styles.list, isShowEmptyState() ? { flex: 1 } : null]}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        isShowEmptyState() ? (
          <View style={styles.center}>
            <Text style={[styles.emptyText, { color: theme.colors.mutedText }]}>{STRINGS.NO_THEATERS_FOUND}</Text>
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
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{STRINGS.NEARBY_THEATERS}</Text>
      </View>
      {renderSearchSection()}
      {isShowInitialLoader() ? renderLoader() : renderTheaterList()}
    </SafeAreaView>
  );
}
