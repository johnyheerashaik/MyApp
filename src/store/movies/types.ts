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

export type CastMember = {
    id: number;
    name: string;
    character: string;
    profilePath: string | null;
};

export type MovieDetails = {
    id: number;
    title: string;
    overview: string;
    year: string;
    releaseDate?: string; // Full date YYYY-MM-DD
    rating: number;
    runtime: number | null;
    genres: string[];
    poster: string | null;
    backdrop: string | null;
    cast: CastMember[];
};