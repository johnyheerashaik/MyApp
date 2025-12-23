import {useCallback, useEffect, useState} from 'react';
import Voice from '@react-native-voice/voice';
import {PermissionsAndroid, Platform} from 'react-native';

type Args = {
  onFinalText: (text: string) => void;
};

export function useVoiceInput({onFinalText}: Args) {
  const [isRecording, setIsRecording] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  useEffect(() => {
    const onSpeechResults = (event: any) => {
      const text = event?.value?.[0];
      if (text) onFinalText(text);
      setIsRecording(false);
    };

    const onSpeechStart = () => setIsRecording(true);
    const onSpeechEnd = () => setIsRecording(false);
    const onSpeechError = (e: any) => {
      setIsRecording(false);
      setVoiceError(e?.error?.message || 'Voice error');
    };

    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [onFinalText]);

  const startVoice = useCallback(async () => {
    try {
      setVoiceError(null);

      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs access to your microphone for voice input.',
            buttonPositive: 'OK',
          },
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setVoiceError('Microphone permission denied');
          return;
        }
      }

      await Voice.start('en-US');
    } catch (e: any) {
      setIsRecording(false);
      setVoiceError(e?.message || 'Voice start error');
    }
  }, []);

  const stopVoice = useCallback(async () => {
    try {
      await Voice.stop();
      setIsRecording(false);
    } catch (e: any) {
      setIsRecording(false);
      setVoiceError(e?.message || 'Voice stop error');
    }
  }, []);

  return {isRecording, voiceError, startVoice, stopVoice, setVoiceError};
}
