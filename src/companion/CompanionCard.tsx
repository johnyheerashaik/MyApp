import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Keyboard,
  Animated,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Movie, searchMovies } from '../services/movieApi';
import { askCompanion } from '../services/companionApi';
import { APP_STRINGS } from '../constants';
import styles from './styles';

export type Message = {
  id: string;
  from: 'user' | 'bot';
  text: string;
  suggestedMovies?: Movie[]; // Movies found from the response
};

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
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList<Message>>(null);

  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLoading) {
      const animate = (dot: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        );
      };

      const animation1 = animate(dot1, 0);
      const animation2 = animate(dot2, 150);
      const animation3 = animate(dot3, 300);

      animation1.start();
      animation2.start();
      animation3.start();

      return () => {
        animation1.stop();
        animation2.stop();
        animation3.stop();
      };
    }
  }, [isLoading, dot1, dot2, dot3]);

  const quickActions = [
    { emoji: '🎲', text: 'Surprise me', prompt: 'Surprise me with something amazing based on what I like' },
    { emoji: '🔥', text: 'Trending', prompt: 'What are the best trending movies right now?' },
    { emoji: '🌙', text: 'Tonight', prompt: 'Perfect movie for tonight based on my taste' },
    { emoji: '😂', text: 'Laugh', prompt: 'Make me laugh - suggest comedies' },
    { emoji: '🤯', text: 'Mind-blowing', prompt: 'Movies that will blow my mind' },
    { emoji: '💕', text: 'Romance', prompt: 'Best romantic movies for me' },
  ];

  const extractAndSearchMovies = async (responseText: string): Promise<Movie[]> => {
    console.log('extractAndSearchMovies called');
    
    const cleanedText = responseText.replace(/^\d+\.\s+/gm, '');
    
    const patterns = [
      /\*\*([^*]+)\*\*/g,       // **Title**
      /\*([^*]+)\*/g,           // *Title*
      /[""]([^"""]+)[""]|"([^"]+)"/g,  // "Title" or "Title"
      /'([^']+)'/g,              // 'Title'
    ];
    
    const potentialTitles = new Set<string>();
    
    patterns.forEach((pattern, index) => {
      const matches = [...cleanedText.matchAll(pattern)];
      matches.forEach(match => {
        const title = match[1] || match[2];
        if (title && title.length > 2 && title.length < 100 && !title.includes('\n')) {
          let cleanTitle = title.trim();
          cleanTitle = cleanTitle.split(' - ')[0].trim();
          cleanTitle = cleanTitle.replace(/[.,!?;:]+$/, '').trim();
          
          if (cleanTitle.split(' ').length > 0 && cleanTitle.length > 3) {
            potentialTitles.add(cleanTitle);
          }
        }
      });
    });

    if (potentialTitles.size === 0) {
      return [];
    }

    const moviePromises = Array.from(potentialTitles).map(async title => {
      try {
        const results = await searchMovies(title);
        return results.length > 0 ? results[0] : null;
      } catch (error) {
        return null;
      }
    });

    const movies = await Promise.all(moviePromises);
    const validMovies = movies.filter((m): m is Movie => m !== null);
    
    const favoriteIds = new Set(favorites.map(f => f.id));
    const favoriteTitles = new Set(favorites.map(f => f.title.toLowerCase()));
    
    const filteredMovies = validMovies.filter(movie => {
      const isInFavorites = favoriteIds.has(movie.id) || favoriteTitles.has(movie.title.toLowerCase());
      return !isInFavorites;
    });
    
    return shuffleArray(filteredMovies);
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      from: 'user',
      text: trimmed,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    Keyboard.dismiss();
    setIsLoading(true);

    try {
      const reply = await askCompanion(
        trimmed,
        favorites,
        userName ?? 'Guest',
        userId ?? undefined,
      );

      const suggestedMovies = await extractAndSearchMovies(reply);

      const botMessage: Message = {
        id: Math.random().toString(),
        from: 'bot',
        text: reply,
        suggestedMovies: suggestedMovies.length > 0 ? suggestedMovies : undefined,
      };

      setMessages(prev => [...prev, botMessage]);
      
      const {logAIChat, logAIRecommendation} = await import('../services/analytics');
      logAIChat('user_message');
      if (suggestedMovies.length > 0) {
        logAIRecommendation(suggestedMovies.length);
      }
    } catch (err) {
      const errorMessage: Message = {
        id: 'error-' + Date.now().toString(),
        from: 'bot',
        text: APP_STRINGS.SOMETHING_WENT_WRONG,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMovie = (movie: Movie) => {
    if (onAddToFavorites) {
      onAddToFavorites(movie);
    }
  };

  const isAlreadyFavorite = (movieId: number) => {
    return favorites.some(fav => fav.id === movieId);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.mode === 'dark' ? 'rgba(30, 41, 59, 0.95)' : theme.colors.card }]}>
      {/* Header */}
      <Text style={[styles.headerText, { color: theme.colors.text }]}>
        {userName ? APP_STRINGS.HEY_USER(userName) : APP_STRINGS.HEY_THERE}
      </Text>

      {/* Chat list – only rendered when there are messages */}
      {messages.length > 0 && (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={true}
          style={styles.chatContainer}
          contentContainerStyle={styles.chatList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          renderItem={({ item }) => {
            const isUser = item.from === 'user';

            return (
              <View>
                <View
                  style={[
                    styles.messageBubble,
                    isUser ? styles.userBubble : styles.botBubble,
                    {
                      backgroundColor: isUser
                        ? theme.colors.primary
                        : theme.mode === 'dark' 
                          ? 'rgba(203, 213, 225, 0.2)' // Much lighter gray for dark mode
                          : theme.colors.inputBackground,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.messageText,
                      {
                        color: isUser ? '#ffffff' : theme.colors.text,
                      },
                    ]}>
                    {item.text}
                  </Text>
                </View>

                {/* Show suggested movies with Add to Favorites buttons */}
                {!isUser && item.suggestedMovies && item.suggestedMovies.length > 0 && (
                  <View style={styles.movieSuggestions}>
                    {item.suggestedMovies.map((movie) => {
                      const isFav = isAlreadyFavorite(movie.id);
                      return (
                        <View key={movie.id} style={[styles.movieSuggestionCard, {
                          backgroundColor: theme.mode === 'dark' 
                            ? 'rgba(71, 85, 105, 0.3)' 
                            : 'rgba(0,0,0,0.05)',
                          borderColor: theme.mode === 'dark' 
                            ? 'rgba(148, 163, 184, 0.3)' 
                            : 'rgba(0,0,0,0.1)',
                        }]}>
                          <View style={styles.movieSuggestionInfo}>
                            <Text style={[styles.movieSuggestionTitle, {color: theme.colors.text}]} numberOfLines={1}>
                              {movie.title}
                            </Text>
                            <Text style={[styles.movieSuggestionYear, {color: theme.colors.mutedText}]}>
                              {movie.year} • ⭐ {movie.rating.toFixed(1)}
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={[
                              styles.addToFavButton,
                              {
                                backgroundColor: isFav 
                                  ? theme.mode === 'dark' ? 'rgba(148, 163, 184, 0.3)' : 'rgba(0,0,0,0.1)'
                                  : theme.colors.primary,
                              },
                            ]}
                            onPress={() => !isFav && handleAddMovie(movie)}
                            disabled={isFav}>
                            <Text style={[styles.addToFavText, {
                              color: isFav ? theme.colors.mutedText : '#ffffff',
                            }]}>
                              {isFav ? '✓ Added' : '+ Add'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          }}
        />
      )}

      {/* Loading indicator - show while AI is thinking */}
      {isLoading && (
        <View style={[styles.messageBubble, styles.botBubble, {
          backgroundColor: theme.mode === 'dark' 
            ? 'rgba(203, 213, 225, 0.2)' 
            : theme.colors.inputBackground,
        }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.messageText, { color: theme.colors.mutedText, marginRight: 8 }]}>
              Thinking
            </Text>
            <View style={styles.typingIndicator}>
              <Animated.View 
                style={[
                  styles.typingDot, 
                  { 
                    backgroundColor: theme.colors.text,
                    opacity: dot1,
                    transform: [{
                      translateY: dot1.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -8],
                      })
                    }]
                  }
                ]} 
              />
              <Animated.View 
                style={[
                  styles.typingDot, 
                  { 
                    backgroundColor: theme.colors.text,
                    opacity: dot2,
                    transform: [{
                      translateY: dot2.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -8],
                      })
                    }]
                  }
                ]} 
              />
              <Animated.View 
                style={[
                  styles.typingDot, 
                  { 
                    backgroundColor: theme.colors.text,
                    opacity: dot3,
                    transform: [{
                      translateY: dot3.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -8],
                      })
                    }]
                  }
                ]} 
              />
            </View>
          </View>
        </View>
      )}

      {/* Quick Actions - Show when no messages */}
      {messages.length === 0 && (
        <View style={styles.quickActionsContainer}>
          <Text style={[styles.quickActionsTitle, { color: theme.colors.mutedText }]}>
            Quick picks:
          </Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.quickActionButton, {
                  backgroundColor: theme.mode === 'dark' 
                    ? 'rgba(71, 85, 105, 0.3)' 
                    : 'rgba(0,0,0,0.05)',
                  borderColor: theme.mode === 'dark' 
                    ? 'rgba(148, 163, 184, 0.3)' 
                    : 'rgba(0,0,0,0.1)',
                }]}
                onPress={() => {
                  setInput(action.prompt);
                  setTimeout(() => sendMessage(), 100);
                }}>
                <Text style={styles.quickActionEmoji}>{action.emoji}</Text>
                <Text style={[styles.quickActionText, { color: theme.colors.text }]}>
                  {action.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Input Row */}
      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder={APP_STRINGS.ASK_ABOUT_MOVIES}
          placeholderTextColor={theme.colors.mutedText}
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.inputBackground,
              color: theme.colors.text,
            },
          ]}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[
            styles.askButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={sendMessage}>
          <Text style={styles.askButtonText}>{APP_STRINGS.ASK}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
