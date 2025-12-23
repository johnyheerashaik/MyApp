import React, {memo} from 'react';
import {TouchableOpacity, Text} from 'react-native';

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
        style,
        {backgroundColor: isRecording ? muted : primary, justifyContent: 'center', alignItems: 'center'},
      ]}
      onPress={onPress}
      accessibilityLabel={isRecording ? 'Stop voice input' : 'Start voice input'}
    >
      <Text style={{color: '#fff', fontSize: 18}}>{isRecording ? '■' : '🎤'}</Text>
    </TouchableOpacity>
  );
}

export default memo(VoiceButtonBase);
