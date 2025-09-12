import axios from 'axios';
import { LibraryEndpoints } from "../../types/endpoints";
import { convertMovieToPartial, StatsModel, Movie, MoviePartial, QueueResponse} from "../../types/library";

export async function getAllMovies(): Promise<MoviePartial[]> {
    const response = await axios.get(LibraryEndpoints.GET_ALL_MOVIES);
    const data = (await response.data) as Movie[];

    const movies: MoviePartial[] = data.map((item: any) => (convertMovieToPartial(item)));

    return movies;
}

export async function getStats(): Promise<StatsModel> {
    const response = await axios.get(LibraryEndpoints.GET_STATS);
    const data = (await response.data) as StatsModel;
    return data;
}

export async function getQueue(): Promise<QueueResponse> {
    const response = await axios.get(LibraryEndpoints.GET_QUEUE);
    const data = (await response.data) as QueueResponse;
    return data;
}

export async function addNewMovie(request: MoviePartial) {
    const response = await axios.post(LibraryEndpoints.ADD_MOVIE, request);
    const movie = (await response.data) as Movie;
    return movie;
}