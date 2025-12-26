import React, {useState} from 'react';
import {View, TouchableOpacity, Text} from 'react-native';
import {Movie} from '../services/movieApi';
import CompanionCard from '../companion/CompanionCard';
import type { Message } from '../companion/types/types';
import styles from './styles';
import {useTheme} from '../theme/ThemeContext';

type Props = {
  visible: boolean;
  onOpen: () => void;
  onClose: () => void;
  userName?: string | null;
  userId?: string | null;
  favorites: Movie[];
  onAddToFavorites?: (movie: Movie) => void;
};

export default function FloatingCompanion({
  visible,
  onOpen,
  onClose,
  userName,
  userId,
  favorites,
  onAddToFavorites,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const theme = useTheme();

  return (
    <>
      <TouchableOpacity style={[styles.aiFab, {backgroundColor: theme.colors.primary}]} onPress={onOpen}>
        <Text style={styles.aiFabText}>🤖</Text>
      </TouchableOpacity>

      {visible && (
        <View style={styles.aiPopupOverlay} pointerEvents="box-none">
          <TouchableOpacity
            style={[styles.aiBackdrop, {backgroundColor: theme.colors.overlay}]}
            activeOpacity={1}
            onPress={onClose}
          />

          <View style={styles.aiPopupCard}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.aiCloseButton, {backgroundColor: theme.colors.overlay}]}
            >
              <Text style={[styles.aiCloseText, {color: theme.colors.text}]}>✕</Text>
            </TouchableOpacity>

            <CompanionCard
              userName={userName}
              userId={userId}
              favorites={favorites}
              messages={messages}
              setMessages={setMessages}
              onAddToFavorites={onAddToFavorites}
            />
          </View>
        </View>
      )}
    </>
  );
}
