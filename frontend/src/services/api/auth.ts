import axios from 'axios';
import { CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { User } from '../../types/user';
import { AuthResponse, LoginRequest, TokenRequest } from '../../types/auth';
import { AuthEndpoints } from '../../types/endpoints';

interface JwtPayload {
    email: string;
}

export async function externalLogin(credentialResponse: CredentialResponse) {
    const response = await axios.post(AuthEndpoints.EXTERNAL_LOGIN, credentialResponse);
    const authResponse = (await response.data) as AuthResponse;
    const jwtToken = jwtDecode<JwtPayload>(authResponse.token);
    const user: User = {
        email: jwtToken.email,
        refreshToken: authResponse.refreshToken,
    };
    return [response.status, user, authResponse.token] as const;
}

export async function register(request: LoginRequest) {
    const response = await axios.post(AuthEndpoints.REGISTER, request);
    const authResponse = (await response.data) as AuthResponse;
    const user: User = {
        email: request.email,
        refreshToken: authResponse.refreshToken,
    };
    return [response.status, user, authResponse.token] as const;
}

export async function requestToken(request: TokenRequest) {
    const response = await axios.post(AuthEndpoints.REFRESH_TOKEN, request);
    const authResponse = (await response.data) as AuthResponse;
    return [response.status, authResponse] as const;
}

export async function login(request: LoginRequest) {
    const response = await axios.post(AuthEndpoints.LOGIN, request);
    const authResponse = (await response.data) as AuthResponse;
    const user: User = {
        email: request.email,
        refreshToken: authResponse.refreshToken,
    };
    return [response.status, user, authResponse.token] as const;
}

export async function logout(email: string) {
    const response = await axios.get(AuthEndpoints.LOGOUT, {
        params: {
            email: email,
        },
    });
    return response.status;
}
