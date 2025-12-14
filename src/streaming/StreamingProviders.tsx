import React, {useEffect, useState} from 'react';
import {View, Text, Image, ScrollView, TouchableOpacity, Linking} from 'react-native';
import {getMovieWatchProviders, WatchProviderData} from '../services/movieApi';
import {useTheme} from '../theme/ThemeContext';
import styles from './styles';

type Props = {
  movieId: number;
};

export default function StreamingProviders({movieId}: Props) {
  const theme = useTheme();
  const [providers, setProviders] = useState<WatchProviderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProviders();
  }, [movieId]);

  const loadProviders = async () => {
    setLoading(true);
    const data = await getMovieWatchProviders(movieId);
    setProviders(data);
    setLoading(false);
  };

  const openJustWatch = () => {
    if (providers?.link) {
      Linking.openURL(providers.link);
    }
  };

  if (loading) {
    return null;
  }

  if (!providers || (!providers.flatrate && !providers.rent && !providers.buy)) {
    return (
      <View style={[styles.container, {backgroundColor: theme.colors.card}]}>
        <Text style={[styles.title, {color: theme.colors.text}]}>Where to Watch</Text>
        <Text style={[styles.noProviders, {color: theme.colors.mutedText}]}>
          Not currently available on streaming services in the US
        </Text>
      </View>
    );
  }

  const renderProviderSection = (title: string, providerList: any[], type: 'stream' | 'rent' | 'buy') => {
    if (!providerList || providerList.length === 0) return null;

    const getTypeColor = () => {
      switch (type) {
        case 'stream': return '#10B981';
        case 'rent': return '#F59E0B';
        case 'buy': return '#EF4444';
      }
    };

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>{title}</Text>
          <View style={[styles.badge, {backgroundColor: getTypeColor()}]}>
            <Text style={styles.badgeText}>
              {type === 'stream' ? 'Included' : type === 'rent' ? 'Rent' : 'Buy'}
            </Text>
          </View>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.providerList}>
          {providerList.map((provider) => (
            <View key={provider.provider_id} style={[styles.providerCard, {backgroundColor: theme.colors.background}]}>
              <Image
                source={{uri: `https://image.tmdb.org/t/p/original${provider.logo_path}`}}
                style={styles.providerLogo}
                resizeMode="contain"
              />
              <Text style={[styles.providerName, {color: theme.colors.text}]} numberOfLines={1}>
                {provider.provider_name}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.card}]}>
      <View style={styles.header}>
        <Text style={[styles.title, {color: theme.colors.text}]}>Where to Watch</Text>
        {providers.link && (
          <TouchableOpacity onPress={openJustWatch} style={styles.justWatchButton}>
            <Text style={[styles.justWatchText, {color: theme.colors.primary}]}>
              View All →
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {renderProviderSection('Stream', providers.flatrate || [], 'stream')}
      {renderProviderSection('Rent', providers.rent || [], 'rent')}
      {renderProviderSection('Buy', providers.buy || [], 'buy')}

      <Text style={[styles.disclaimer, {color: theme.colors.mutedText}]}>
        Powered by JustWatch • US availability
      </Text>
    </View>
  );
}
