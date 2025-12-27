import { Platform } from 'react-native';
import { apiCall } from './api';
import { trackOperation } from './performance';

const BACKEND_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:4000'
    : 'http://localhost:4000';

export type Theater = {
  id: string;
  name: string;
  address: string;
  distance: number;
  latitude: number;
  longitude: number;
};

const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const fetchNearbyTheaters = async (lat: number, lng: number): Promise<Theater[]> => {
  return trackOperation('fetchNearbyTheaters', async () => {
    const radius = 32186.9;
    const url = `${BACKEND_URL}/theaters/nearby?latitude=${lat}&longitude=${lng}&radius=${radius}`;
    const response = await apiCall<any>({
      url,
      method: 'GET',
    });
    const data = response.data;
    if (data.error) {
      throw new Error(data.message || data.error);
    }
    if (!data.results) {
      return [];
    }
    const theatersData: Theater[] = data.results.map((place: any) => {
      const distance = calculateDistance(
        lat,
        lng,
        place.geometry.location.lat,
        place.geometry.location.lng
      );
      return {
        id: place.place_id,
        name: place.name,
        address: place.vicinity,
        distance,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
      };
    });
    const filtered = theatersData.filter(t => t.distance <= 20).sort((a, b) => a.distance - b.distance);
    return filtered;
  });
};

export const geocodeZipCode = async (zip: string): Promise<{ lat: number; lng: number }> => {
  return trackOperation('geocodeZipCode', async () => {
    const url = `${BACKEND_URL}/geocode/zipcode?zip=${zip}`;
    const response = await apiCall<any>({
      url,
      method: 'GET',
    });
    const data = response.data;
    if (data.error) {
      throw new Error(data.error);
    }
    return data.location;
  });
};
