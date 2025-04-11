import axios, { AxiosResponse } from 'axios';
import { CredentialResponse } from '@react-oauth/google';

import { User } from '../../types/user';
import { AuthResponse, LoginRequest, TokenRequest } from '../../types/auth';
import { AuthEndpoints } from '../../types/endpoints';

export async function externalLogin(credentialResponse: CredentialResponse) {
    const response = await axios.post(AuthEndpoints.EXTERNAL_LOGIN, credentialResponse);
    const authResponse = (await response.data) as AuthResponse;
    const user: User = {
        // TODO: get email from credentialResponse
        email: "google",
        accessToken: authResponse.token,
        refreshToken: authResponse.refreshToken,
    };
    return [response.status, user] as const;
}

export async function register(request: LoginRequest) {
    const response = await axios.post(AuthEndpoints.REGISTER, request);
    const authResponse = (await response.data) as AuthResponse;
    const user: User = {
        email: request.email,
        accessToken: authResponse.token,
        refreshToken: authResponse.refreshToken,
    };
    return [response.status, user] as const;
}

export async function refreshToken(request: TokenRequest) {
    const response = await axios.post(AuthEndpoints.REFRESH_TOKEN, request);
    const authResponse = (await response.data) as AuthResponse;
    return [response.status, authResponse] as const;
}

export async function login(request: LoginRequest) {
    const response = await axios.post(AuthEndpoints.LOGIN, request);
    const authResponse = (await response.data) as AuthResponse;
    const user: User = {
        email: request.email,
        accessToken: authResponse.token,
        refreshToken: authResponse.refreshToken,
    };
    return [response.status, user] as const;
}

export async function logout() {
    const response = await axios.get(AuthEndpoints.LOGOUT);
    return response.status;
}
