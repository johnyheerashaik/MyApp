import React, {useState} from 'react';
import {View, TouchableOpacity, Text} from 'react-native';
import {Movie} from '../services/movieApi';
import CompanionCard from '../companion/CompanionCard';
import type { Message } from '../companion/types/types';
import styles from './styles';

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

  return (
    <>
      <TouchableOpacity style={styles.aiFab} onPress={onOpen}>
        <Text style={styles.aiFabText}>🤖</Text>
      </TouchableOpacity>

      {visible && (
        <View style={styles.aiPopupOverlay} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.aiBackdrop}
            activeOpacity={1}
            onPress={onClose}
          />

          <View style={styles.aiPopupCard}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.aiCloseButton}>
              <Text style={styles.aiCloseText}>✕</Text>
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
