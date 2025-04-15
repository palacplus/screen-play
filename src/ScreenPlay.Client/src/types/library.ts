export type Movie = {
    title: string;
    year: string | null | undefined;
    rated: string | null | undefined;
    releaseDate: string | null | undefined;
    runtime: string | null | undefined,
    genre: string | null | undefined;
    director: string | null | undefined;
    writer: string | null | undefined;
    actors: string[] | null | undefined;
    description: string;
    language: string | null | undefined;
    country: string | null | undefined;
    awards: string | null | undefined;
    poster: string;
    ratings: Rating[]| null | undefined;
    metascore: number | null | undefined;
    imdbRating: number | null | undefined;
    imdbVotes: number | null | undefined;
    imdbID: string | null | undefined;
    boxOffice: string | null | undefined;
    addedDate: Date;
}

type Rating = {
    source: string;
    value: string;
}