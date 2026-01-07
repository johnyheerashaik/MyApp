import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    Share,
    ActivityIndicator,
    TouchableOpacity,
    Text,
    Platform,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { useLocationFetch } from '../theatres/hooks/useLocationFetch';
import Icon from 'react-native-vector-icons/Ionicons';


type LatLng = { latitude: number; longitude: number };

const DEFAULT_REGION = { latitudeDelta: 0.01, longitudeDelta: 0.01 };

const LocationScreen = () => {
    const [location, setLocation] = useState<LatLng | null>(null);
    const [region, setRegion] = useState<Region | null>(null);
    const [loading, setLoading] = useState(false);


    const fetchByCoords = useCallback((latitude: number, longitude: number) => {
        setLocation({ latitude, longitude });
        setRegion({ latitude, longitude, ...DEFAULT_REGION });
        setLoading(false);
    }, []);

    const { requestLocationPermission } = useLocationFetch({ fetchByCoords });

    useEffect(() => {
        setLoading(true);
        requestLocationPermission();
    }, [requestLocationPermission]);

    const handleShare = async () => {
        if (location) {
            try {
                await Share.share({
                    message: `My real-time location: https://maps.google.com/?q=${location.latitude},${location.longitude}`,
                });
            } catch (error) {
            }
        }
    };

    const zoomIn = useCallback(() => {
        setRegion(r =>
            r
                ? { ...r, latitudeDelta: r.latitudeDelta / 2, longitudeDelta: r.longitudeDelta / 2 }
                : r
        );
    }, []);

    const zoomOut = useCallback(() => {
        setRegion(r =>
            r ? { ...r, latitudeDelta: r.latitudeDelta * 2, longitudeDelta: r.longitudeDelta * 2 } : r
        );
    }, []);

    const recenter = useCallback(() => {
        if (!location) return;
        setRegion({ latitude: location.latitude, longitude: location.longitude, ...DEFAULT_REGION });
    }, [location]);

    return (
        <View style={styles.container}>
            {loading && <ActivityIndicator style={{ margin: 16 }} />}

            {location && region && (
                <View style={styles.mapContainer}>
                    <MapView
                        style={styles.map}
                        region={region}
                        scrollEnabled
                        zoomEnabled
                        pitchEnabled
                        onRegionChangeComplete={setRegion}
                    >
                        {location && <Marker coordinate={location} />}
                    </MapView>

                    <TouchableOpacity style={styles.sharePill} onPress={handleShare} activeOpacity={0.8}>
                        <Icon name="share-social-outline" size={20} color="#1A73E8" />
                        <Text style={styles.shareText}>Share</Text>
                    </TouchableOpacity>

                    <View style={styles.controlsRight}>
                        <TouchableOpacity style={[styles.fab, styles.shadow]} onPress={recenter} activeOpacity={0.8}>
                            <Icon name="locate" size={24} color="#1A73E8" />
                        </TouchableOpacity>

                        <View style={[styles.zoomCard, styles.shadow]}>
                            <TouchableOpacity style={styles.zoomBtn} onPress={zoomIn} activeOpacity={0.8}>
                                <Icon name="add-circle-outline" size={24} color="#1F1F1F" />
                            </TouchableOpacity>

                            <View style={styles.divider} />

                            <TouchableOpacity style={styles.zoomBtn} onPress={zoomOut} activeOpacity={0.8}>
                                <Icon name="remove-circle-outline" size={24} color="#1F1F1F" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f8f8' },
    mapContainer: { flex: 1, position: 'relative' },
    map: { ...StyleSheet.absoluteFillObject },

    controlsRight: {
        position: 'absolute',
        right: 16,
        bottom: 120,
        gap: 12,
        alignItems: 'center',
    },

    sharePill: {
        position: 'absolute',
        left: 16,
        bottom: 120,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 14,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.96)',
        ...Platform.select({
            android: { elevation: 4 },
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 10,
            },
        }),
    },
    shareText: { fontSize: 16, fontWeight: '600', color: '#1A73E8' },

    fab: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.96)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    zoomCard: {
        width: 44,
        borderRadius: 22,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.96)',
    },
    zoomBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.08)' },

    shadow: Platform.select({
        android: { elevation: 4 },
        ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 10,
        },
    }) as any,
});

export default LocationScreen;
