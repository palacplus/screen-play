export type AuthResponse = {
    token: string | null;
    refreshToken: string | null;
    expiration: Date;
    errorMessage: string | null;
}

export type LoginInfo = {
    email: string;
    password: string;
    rememberMe: boolean;
}

export type LoginInfo = {
    email: string;
    password: string;
    confirmPassword: string;
}