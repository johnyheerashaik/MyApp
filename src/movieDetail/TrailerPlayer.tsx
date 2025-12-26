import React from 'react';
import {View, Text, TouchableOpacity, Linking, Dimensions} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import styles from './trailerStyles';
import {logTrailerPlay} from '../services/analytics';
import { STRINGS } from '../common/strings';

const {width} = Dimensions.get('window');

interface TrailerPlayerProps {
  trailerKey: string;
  textColor: string;
}

export default function TrailerPlayer({trailerKey, textColor}: TrailerPlayerProps) {
  const handleOpenYouTube = async () => {
    logTrailerPlay(trailerKey, 'YouTube Trailer');
    Linking.openURL(`https://www.youtube.com/watch?v=${trailerKey}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, {color: textColor}]}>{STRINGS.TRAILER}</Text>
        <TouchableOpacity onPress={handleOpenYouTube} style={styles.youtubeButton}>
          <Text style={styles.youtubeButtonText}>{STRINGS.OPEN_IN_YOUTUBE}</Text>
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
