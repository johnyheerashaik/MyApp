import React, {memo} from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import { ICON_SIZE } from '../../constants/spacing';
import { STRINGS } from '../../common/strings';

type Props = {
  isRecording: boolean;
  primary: string;
  muted: string;
  onPress: () => void;
  style?: any;
};

function VoiceButtonBase({isRecording, primary, muted, onPress, style}: Props) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {backgroundColor: isRecording ? muted : primary},
        style,
      ]}
      onPress={onPress}
        accessibilityLabel={isRecording ? STRINGS.VOICE_STOP : STRINGS.VOICE_START}
    >
      <Text style={styles.icon}>{isRecording ? '■' : '🎤'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    width: ICON_SIZE.XL,
    height: ICON_SIZE.XL,
    borderRadius: ICON_SIZE.XL / 2,
  },
  icon: {
    color: '#fff',
    fontSize: 18,
  },
});

export default memo(VoiceButtonBase);
