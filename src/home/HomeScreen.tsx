import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { useFavorites } from '../favorites/FavoritesContext';
import HomeHeader from '../header/HomeHeader';
import FavoritesSection from '../favorites/FavoritesSection';
import FloatingCompanion from '../floatingCompanion/FloatingCompanion';
import ProfileMenu from '../profile/ProfileMenu';
import styles from './styles';

type Props = {
  navigation: any;
};

export default function HomeScreen({ navigation }: Props) {
  const { user, signOut } = useAuth();
  const theme = useTheme();
  const { favorites, addFavorite, removeFavorite } = useFavorites();

  const [showMenu, setShowMenu] = useState(false);
  const [showCompanion, setShowCompanion] = useState(false);
  const [companionMessages, setCompanionMessages] = useState<any[]>([]);

  const handleLogout = () => {
    setShowMenu(false);
    signOut();
  };

  const handleLogin = () => {
    setShowMenu(false);
    navigation.navigate('Login');
  };

  const initials = user?.name
    ? user.name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
    : 'G';

  const isDarkMode = theme.mode === 'dark';

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <HomeHeader
        userName={user?.name}
        initials={initials}
        onPressAvatar={() => setShowMenu(true)}
      />

      <FavoritesSection
        favorites={favorites}
        onPressMovie={movieId =>
          navigation.navigate('MovieDetails', { movieId })
        }
        onRemoveFavorite={removeFavorite}
      />

      {!showCompanion && (
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => navigation.navigate('Movies')}>
            <Text style={styles.primaryButtonText}>View Movies</Text>
          </TouchableOpacity>
        </View>
      )}

      <FloatingCompanion
        visible={showCompanion}
        onOpen={() => setShowCompanion(true)}
        onClose={() => setShowCompanion(false)}
        userName={user?.name}
        userId={user?.id}
        favorites={favorites}
        onAddToFavorites={addFavorite}
      />

      <ProfileMenu
        visible={showMenu}
        initials={initials}
        userName={user?.name ?? null}
        email={user?.email ?? null}
        isDarkMode={isDarkMode}
        onToggleTheme={theme.toggleTheme}
        onClose={() => setShowMenu(false)}
        onPressSignIn={handleLogin}
        onPressSignOut={handleLogout}
      />
    </SafeAreaView>
  );
}
