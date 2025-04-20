export enum AuthEndpoints {
    EXTERNAL_LOGIN = "api/auth/external-login",
    REGISTER = "api/auth/register",
    LOGIN = "api/auth/login",
    LOGOUT = "api/auth/logout",
    REFRESH_TOKEN = "api/auth/refresh-token",
}

export enum LibraryEndpoints {
    GET_ALL_MOVIES = "api/movies",
    GET_MOVIE = "api/movies/:id",
    ADD_MOVIE = "api/movies/queue",
    GET_STATS = "api/movies/stats",
}
