export type StatsModel = {
    movieCount: number;
    userCount: number;
    ratingsCount: number;
};

export type MoviePartial = {
    tmdbId: number;
    title: string;
    year: string | null | undefined;
    rated: string | null | undefined;
    released: string | null | undefined;
    runtime: string | null | undefined;
    genre: string | null;
    director: string | null | undefined;
    writer: string | null | undefined;
    actors: string | null | undefined;
    plot: string;
    language: string | null | undefined;
    country: string | null | undefined;
    awards: string | null | undefined;
    poster: string;
    ratings: AltRating[] | null | undefined;
    metascore: string | null | undefined;
    imdbRating: string | null | undefined;
    imdbVotes: string | null | undefined;
    imdbID: string | null | undefined;
    boxOffice: string | null | undefined;
    addedDate: Date;
};

type AltRating = {
    source: string;
    value: string;
};

export type Movie = {
    id: number;
    imdbId: string;
    tmdbId: number;
    title: string;
    year: number;
    description: string;
    rated: string;
    fileName: string;
    originalTitle: string;
    language: string;
    sortTitle: string;
    sizeOnDisk: number;
    status: string;
    releaseDate: string | null;
    images: Image[];
    youTubeTrailerId: string;
    studio: string;
    path: string;
    qualityProfileId: number;
    hasFile: boolean;
    monitored: boolean;
    minimumAvailability: string;
    isAvailable: boolean;
    folderName: string;
    runtime: number;
    cleanTitle: string;
    titleSlug: string;
    rootFolderPath: string;
    genres: string[];
    tags: string[];
    added: string;
    ratings: Rating[];
    popularity: number;
    director: string;
    actors: string[];
    writers: string[];
    country: string;
    awards: string;
    boxOffice: string;
    isDeleted: boolean;
    deletedDate: string | null;
    updatedDate: string;
    createdDate: string;
    isComplete: boolean;
};

export type Image = {
    id: number;
    movieId: number;
    coverType: string;
    url: string;
    remoteUrl: string;
};

export type Rating = {
    id: number;
    movieId: number;
    source: string;
    votes: number;
    value: number;
    type: string;
};

/**
 * Converts a Movie object to a MoviePartial object.
 * @param movie The Movie object to convert.
 * @returns The converted MoviePartial object.
 */
export function convertMovieToPartial(movie: Movie): MoviePartial {
    return {
        tmdbId: movie.tmdbId,
        title: movie.title,
        year: movie.year.toString(),
        rated: movie.rated || null,
        released: movie.releaseDate || null,
        runtime: movie.runtime ? `${movie.runtime} min` : null,
        genre: movie.genres?.join(', ') || null,
        director: movie.director || null,
        writer: movie.writers?.join(', ') || null,
        actors: movie.actors?.join(', ') || null,
        plot: movie.description,
        language: movie.language || null,
        country: movie.country || null,
        awards: movie.awards || null,
        poster: movie.images?.find((img) => img.coverType === 'poster')?.remoteUrl || '',
        ratings: movie.ratings
            ? movie.ratings.map((rating) => ({
                  source: rating.source,
                  value: rating.value.toString(),
              }))
            : null,
        metascore: movie.ratings?.find((r) => r.source === 'metacritic')?.value.toString() || null,
        imdbRating: movie.ratings?.find((r) => r.source === 'imdb')?.value.toString() || null,
        imdbVotes: movie.ratings?.find((r) => r.source === 'imdb')?.votes.toString() || null,
        imdbID: movie.imdbId || null,
        boxOffice: movie.boxOffice || null,
        addedDate: new Date(movie.added),
    };
}