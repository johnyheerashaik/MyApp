export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type AppStackParamList = {
  Home: undefined;
  Movies: undefined;
  MovieDetails: { movieId: number };
  Collection: { title: string; keyword: string };
};

export type RootStackParamList = AuthStackParamList & AppStackParamList;
