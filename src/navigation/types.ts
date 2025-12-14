export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type AppStackParamList = {
  Home: undefined;
  Movies: undefined;
  MovieDetails: { movieId: number };
  Collection: { title: string; collectionId?: number; keywordId?: number };
};

export type RootStackParamList = AuthStackParamList & AppStackParamList;
