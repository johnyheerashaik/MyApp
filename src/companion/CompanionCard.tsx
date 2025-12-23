import React, {useCallback, useMemo, useState} from 'react';
import {View, Text} from 'react-native';
import {useTheme} from '../theme/ThemeContext';
import {Movie} from '../services/movieApi';
import {APP_STRINGS} from '../constants';
import styles from './styles';

import type {Message} from './types/types';
import {QUICK_ACTIONS} from './constants';

import ChatList from './components/ChatList';
import QuickActionsGrid from './components/QuickActionsGrid';
import InputRow from './components/InputRow';

import TypingBubble from '../common/components/TypingBubble';

import {useVoiceInput} from './hooks/useVoiceInput';
import {useExtractAndSearchMovies} from './hooks/useExtractAndSearchMovies';
import {useCompanionChat} from './hooks/useCopmanionChat';

import {useThreeDots} from '../common/hooks/useThreeDots';

type Props = {
  userName?: string | null;
  userId?: string | null;
  favorites: Movie[];
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  onAddToFavorites?: (movie: Movie) => void;
};

export default function CompanionCard({
  userName,
  userId,
  favorites,
  messages,
  setMessages,
  onAddToFavorites,
}: Props) {
  const theme = useTheme();
  const [input, setInput] = useState('');

  const favoritesIds = useMemo(() => new Set(favorites.map(f => f.id)), [favorites]);

  const extractAndSearchMovies = useExtractAndSearchMovies(favorites);

  const {isLoading, sendMessage} = useCompanionChat({
    favorites,
    userName,
    userId,
    setMessages,
    extractAndSearchMovies: (reply: string) => extractAndSearchMovies(reply),
  });

  const thinkingDots = useThreeDots(isLoading);

  const handleAddMovie = useCallback(
    (movie: Movie) => {
      onAddToFavorites?.(movie);
    },
    [onAddToFavorites],
  );

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    sendMessage(text);
  }, [input, sendMessage]);

  const {isRecording, voiceError, startVoice, stopVoice} = useVoiceInput({
    onFinalText: (text: string) => {
      setInput('');
      sendMessage(text);
    },
  });

  const onPickQuickAction = useCallback(
    (prompt: string) => {
      setInput('');
      sendMessage(prompt);
    },
    [sendMessage],
  );

  const onToggleVoice = useCallback(() => {
    if (isRecording) stopVoice();
    else startVoice();
  }, [isRecording, startVoice, stopVoice]);

  const cardBg =
    theme.mode === 'dark' ? 'rgba(30, 41, 59, 0.95)' : theme.colors.card;

  return (
    <View style={[styles.container, {backgroundColor: cardBg}]}>
      <Text style={[styles.headerText, {color: theme.colors.text}]}>
        {userName ? APP_STRINGS.HEY_USER(userName) : APP_STRINGS.HEY_THERE}
      </Text>

      {messages.length > 0 ? (
        <ChatList
          messages={messages}
          favoritesIds={favoritesIds}
          mode={theme.mode}
          colors={theme.colors}
          styles={styles}
          onAddMovie={handleAddMovie}
        />
      ) : (
        <QuickActionsGrid
          actions={QUICK_ACTIONS}
          mode={theme.mode}
          colors={theme.colors}
          styles={styles}
          onPick={onPickQuickAction}
        />
      )}

      {isLoading ? (
        <TypingBubble
          styles={styles}
          colors={theme.colors}
          mode={theme.mode}
          d1={thinkingDots.d1}
          d2={thinkingDots.d2}
          d3={thinkingDots.d3}
        />
      ) : null}

      <InputRow
        input={input}
        setInput={setInput}
        placeholder={APP_STRINGS.ASK_ABOUT_MOVIES}
        mode={theme.mode}
        colors={theme.colors}
        styles={styles}
        isRecording={isRecording}
        voiceError={voiceError}
        onSend={handleSend}
        onToggleVoice={onToggleVoice}
      />
    </View>
  );
}
