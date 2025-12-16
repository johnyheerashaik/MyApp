const BACKEND_URL = 'http://localhost:4000';

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
  const radius = 32186.9;
  const url = `${BACKEND_URL}/theaters/nearby?latitude=${lat}&longitude=${lng}&radius=${radius}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.error) {
    console.error('API Error:', data.message || data.error);
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
  // Only one log per function
  console.log('fetchNearbyTheaters called');
  return filtered;
};

export const geocodeZipCode = async (zip: string): Promise<{lat: number; lng: number}> => {
  const url = `${BACKEND_URL}/geocode/zipcode?zip=${zip}`;
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error);
  }
  
  return data.location;
};
