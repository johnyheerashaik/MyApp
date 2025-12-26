import React, {memo} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import { SPACING, BORDER_RADIUS, FONT_SIZE } from '../../constants';
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
          style={[
            localStyles.inputContainer,
            { backgroundColor: colors.inputBackground },
          ]}>
          {isRecording ? (
            <Text style={[localStyles.recordingText, {color: colors.mutedText}]}> 
              Recording <ThreeDots d1={dots.d1} d2={dots.d2} d3={dots.d3} color={colors.mutedText} />
            </Text>
          ) : (
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={placeholder}
              placeholderTextColor={colors.mutedText}
              style={[styles.input, localStyles.input, {color: colors.text}]}
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
          style={[styles.askButton, localStyles.askButton]}
        />
      </View>

      <ErrorText text={voiceError} style={localStyles.errorText} />
    </>
  );
}

const localStyles = StyleSheet.create({
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.BASE,
    paddingHorizontal: SPACING.MD,
  },
  recordingText: {
    fontStyle: 'italic',
    fontSize: FONT_SIZE.MD,
  },
  input: {
    backgroundColor: 'transparent',
  },
  askButton: {
    marginRight: SPACING.XS,
  },
  errorText: {
    color: 'red',
    marginLeft: SPACING.SM,
    marginTop: SPACING.SM,
  },
});

export default memo(InputRowBase);
