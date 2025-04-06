export type AuthResponse = {
    token: string | null;
    refreshToken: string | null;
    expiration: Date;
    errorMessage: string | null;
}

export type UserInfo = {
    email: string;
    password: string;
    rememberMe: boolean;
}

export type NewUserInfo = {
    email: string;
    password: string;
    confirmPassword: string;
}