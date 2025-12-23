export type Movie = {
  id: number;
  title: string;
  year: string;
  releaseDate?: string; 
  rating: number;
  poster: string | null;
  genres?: string[]; 
  overview?: string;
  reminderEnabled?: boolean;
  reminderSent?: boolean;
};


export type Message = {
  id: string;
  from: 'user' | 'bot';
  text: string;
  suggestedMovies?: Movie[];
};
