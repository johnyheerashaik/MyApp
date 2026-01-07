import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOutThunk } from '../store/auth/authSlice';
import { useFavoritesActions } from '../store/favorites/hooks';
import HomeHeader from '../header/HomeHeader';
import FavoritesSection from '../favorites/FavoritesSection';
import FloatingCompanion from '../floatingCompanion/FloatingCompanion';
import ProfileMenu from '../profile/ProfileMenu';
import styles from './styles';
import { useAppDispatch, useAppSelector } from '../store/rtkHooks';
import { selectTheme } from '../store/theme/selectors';
import { selectFavorites } from '../store/favorites/selectors';
import { useAuth } from '../store/auth/hooks';
import { fetchFavorites } from '../store/favorites/favoritesSlice';
import { toggleTheme } from '../store/theme/themeSlice';

type Props = {
  navigation: any;
};

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const signOut = () => dispatch(signOutThunk() as any);
  const theme = useAppSelector(selectTheme);
  const favorites = useAppSelector(selectFavorites);
  const { addFavorite, removeFavorite } = useFavoritesActions();

  const [showMenu, setShowMenu] = useState(false);
  const [showCompanion, setShowCompanion] = useState(false);

  useEffect(() => {
    if (user?.token) {
      dispatch(fetchFavorites(user.token) as any);
    }
  }, [user?.token, dispatch]);;

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
      .map((part: string) => part[0])
      .join('')
      .toUpperCase()
    : 'G';

  const isDarkMode = theme.mode === 'dark';

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

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
        onToggleTheme={handleToggleTheme}
        onClose={() => setShowMenu(false)}
        onPressSignIn={handleLogin}
        onPressSignOut={handleLogout}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;
