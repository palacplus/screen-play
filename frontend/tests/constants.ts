import { use } from "react";
export const STORAGE_STATE_PATH = "playwright/.auth.json";

export const ADMIN_USER = {
    email: "testuser@mymail.com",
    password: "RandomPassword123@@",
}
export const TEST_USER = {
    email: "test@myplace.net",
    password: "njk99Awen@$jn",
}

export const PAGES = {
    home: "/home",
    library: "/library"
}

export const ENDPOINTS = {
    movies: "/api/movies",
    login: "/api/auth/login",
    register: "/api/auth/register",
    logout: "/api/auth/logout",
    user: "/api/auth/user",
}
