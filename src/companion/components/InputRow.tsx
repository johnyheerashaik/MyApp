import React, {memo} from 'react';
import {View, Text, TextInput} from 'react-native';
import {useThreeDots} from '../../common/hooks/useThreeDots';
import ThreeDots from '../../common/components/ThreeDots';
import VoiceButton from '../../common/components/VoiceButton';
import ErrorText from '../../common/components/ErrorText';

type Props = {
  input: string;
  setInput: (v: string) => void;
  placeholder: string;
  mode: 'dark' | 'light';
  colors: any;
  styles: any;

  isRecording: boolean;
  voiceError?: string | null;

  onSend: () => void;
  onToggleVoice: () => void;
};

function InputRowBase({
  input,
  setInput,
  placeholder,
  mode,
  colors,
  styles,
  isRecording,
  voiceError,
  onSend,
  onToggleVoice,
}: Props) {
  const dots = useThreeDots(isRecording);

  return (
    <>
      <View style={styles.inputRow}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.inputBackground,
            borderRadius: 8,
            paddingHorizontal: 12,
          }}>
          {isRecording ? (
            <Text style={{color: colors.mutedText, fontStyle: 'italic', fontSize: 15}}>
              Recording <ThreeDots d1={dots.d1} d2={dots.d2} d3={dots.d3} color={colors.mutedText} />
            </Text>
          ) : (
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={placeholder}
              placeholderTextColor={colors.mutedText}
              style={[styles.input, {backgroundColor: 'transparent', color: colors.text}]}
              onSubmitEditing={onSend}
              returnKeyType="send"
            />
          )}
        </View>

        <VoiceButton
          isRecording={isRecording}
          primary={colors.primary}
          muted={colors.mutedText}
          onPress={onToggleVoice}
          style={[styles.askButton, {marginRight: 4}]}
        />
      </View>

      <ErrorText text={voiceError} style={{color: 'red', marginLeft: 8, marginTop: 6}} />
    </>
  );
}

export default memo(InputRowBase);
