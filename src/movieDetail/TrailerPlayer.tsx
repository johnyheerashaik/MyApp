import React from 'react';
import {View, Text, TouchableOpacity, Linking, Dimensions} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import styles from './trailerStyles';

const {width} = Dimensions.get('window');

interface TrailerPlayerProps {
  trailerKey: string;
  textColor: string;
}

export default function TrailerPlayer({trailerKey, textColor}: TrailerPlayerProps) {
  const handleOpenYouTube = async () => {
    const {logTrailerPlay} = await import('../services/analytics');
    logTrailerPlay(trailerKey, 'YouTube Trailer');
    Linking.openURL(`https://www.youtube.com/watch?v=${trailerKey}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, {color: textColor}]}>Trailer</Text>
        <TouchableOpacity onPress={handleOpenYouTube} style={styles.youtubeButton}>
          <Text style={styles.youtubeButtonText}>Open in YouTube →</Text>
        </TouchableOpacity>
      </View>
      <YoutubePlayer
        height={(width - 32) * 9 / 16}
        play={false}
        videoId={trailerKey}
      />
    </View>
  );
}
