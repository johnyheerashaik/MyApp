import React, {memo, useMemo} from 'react';
import {View, Text} from 'react-native';
import type {Message, Movie} from '../types/types';
import MovieSuggestions from './MovieSuggestions';

type Props = {
  item: Message;
  favoritesIds: Set<number>;
  mode: 'dark' | 'light';
  colors: any;
  styles: any;
  onAddMovie: (movie: Movie) => void;
};

function MessageItemBase({item, favoritesIds, mode, colors, styles, onAddMovie}: Props) {
  const isUser = item.from === 'user';

  const bubbleBg = useMemo(() => {
    if (isUser) return colors.primary;
    return mode === 'dark' ? colors.chatBotBubble : colors.inputBackground;
  }, [isUser, colors.primary, colors.inputBackground, colors.chatBotBubble, mode]);

  return (
    <View>
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.botBubble,
          {backgroundColor: bubbleBg},
        ]}>
        <Text style={[styles.messageText, {color: isUser ? colors.white : colors.text}]}> 
          {item.text}
        </Text>
      </View>

      {!isUser && item.suggestedMovies?.length ? (
        <MovieSuggestions
          movies={item.suggestedMovies as Movie[]}
          favoritesIds={favoritesIds}
          mode={mode}
          colors={colors}
          styles={styles}
          onAddMovie={onAddMovie}
        />
      ) : null}
    </View>
  );
}

export default memo(MessageItemBase);
