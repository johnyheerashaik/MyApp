import { useCallback, useState } from 'react';
import { Keyboard } from 'react-native';
import { askCompanion } from '../../services/companionApi';
import { Movie } from '../types/types';
import { APP_STRINGS } from '../../constants';
import type { Message as BaseMessage } from '../types/types';
import { logAIChat, logAIRecommendation } from '../../services/analytics';

type Message = BaseMessage & {
  suggestedMovies?: Movie[];
};

type Args = {
  favorites: Movie[];
  userName?: string | null;
  userId?: string | null;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  extractAndSearchMovies: (reply: string) => Promise<Movie[]>;
};

export function useCompanionChat({
  favorites,
  userName,
  userId,
  setMessages,
  extractAndSearchMovies,
}: Args) {
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        from: 'user',
        text: trimmed,
      };

      setMessages((prev) => [...prev, userMessage]);
      Keyboard.dismiss();
      setIsLoading(true);

      try {
        const reply = await askCompanion(trimmed, favorites, userName ?? 'Guest', userId ?? undefined);

        const botId = `bot-${Date.now()}`;
        const botMessage: Message = { id: botId, from: 'bot', text: reply };
        setMessages((prev) => [...prev, botMessage]);

        const suggestedMovies = await extractAndSearchMovies(reply);
        if (suggestedMovies.length > 0) {
          setMessages((prev) =>
            prev.map((m) => (m.id === botId ? { ...m, suggestedMovies } : m)),
          );
        }

        logAIChat('user_message');
        if (suggestedMovies.length > 0) logAIRecommendation(suggestedMovies.length);
      } catch (e) {
        setMessages((prev) => [
          ...prev,
          { id: `error-${Date.now()}`, from: 'bot', text: APP_STRINGS.SOMETHING_WENT_WRONG },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [favorites, userName, userId, setMessages, extractAndSearchMovies],
  );

  return { isLoading, sendMessage };
}
