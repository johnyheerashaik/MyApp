import React, {memo, useRef, useCallback} from 'react';
import {FlatList} from 'react-native';
import type {Message} from '../types/types';
import MessageItem from './MessageItem';

type Props = {
  messages: Message[];
  favoritesIds: Set<number>;
  mode: 'dark' | 'light';
  colors: any;
  styles: any;
  onAddMovie: (movie: any) => void;
};

function ChatListBase({messages, favoritesIds, mode, colors, styles, onAddMovie}: Props) {
  const ref = useRef<FlatList<Message>>(null);

  const renderItem = useCallback(
    ({item}: {item: Message}) => (
      <MessageItem
        item={item}
        favoritesIds={favoritesIds}
        mode={mode}
        colors={colors}
        styles={styles}
        onAddMovie={onAddMovie}
      />
    ),
    [favoritesIds, mode, colors, styles, onAddMovie],
  );

  const keyExtractor = useCallback((item: Message) => item.id, []);

  return (
    <FlatList
      ref={ref}
      data={messages}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      showsVerticalScrollIndicator
      style={styles.chatContainer}
      contentContainerStyle={styles.chatList}
      onContentSizeChange={() => ref.current?.scrollToEnd({animated: true})}
      removeClippedSubviews
      keyboardShouldPersistTaps="handled"
      initialNumToRender={12}
      windowSize={8}
      maxToRenderPerBatch={12}
      updateCellsBatchingPeriod={16}
    />
  );
}

export default memo(ChatListBase);
