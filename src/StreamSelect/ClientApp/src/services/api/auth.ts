import { User } from '@/types/user';
import { AuthResponse, LoginRequest, TokenRequest } from '@/types/auth';
import { AuthEndpoints } from '@/types/endpoints';
import axios from 'axios';
import { CredentialResponse } from '@react-oauth/google';


export async function externalLogin(credentialResponse: CredentialResponse) {
    const response = await axios.post(AuthEndpoints.EXTERNAL_LOGIN, credentialResponse);
    if (response.status !== 200) {
        throw new Error(response.statusText);
    }
    const authResponse = (await response.data) as AuthResponse;
    const user: User = {
        // TODO: get email from credentialResponse
        email: "google",
        accessToken: authResponse.accessToken,
        refreshToken: authResponse.refreshToken,
    };
    return [response.status, user] as const;
}

export async function register(request: LoginRequest) {
    const response = await axios.post(AuthEndpoints.REGISTER, request);
    if (response.status !== 201) {
        throw new Error(response.statusText);
    }
    const authResponse = (await response.data) as AuthResponse;
    return [response.status, authResponse] as const;
}

export async function refreshToken(request: TokenRequest) {
    const response = await axios.post(AuthEndpoints.REFRESH_TOKEN, request);
    if (response.status !== 200) {
        throw new Error(response.statusText);
    }
    const authResponse = (await response.data) as AuthResponse;
    return [response.status, authResponse] as const;
}

export async function login(request: LoginRequest) {
    const response = await axios.post(AuthEndpoints.LOGIN, request);
    if (response.status !== 200) {
        throw new Error(response.statusText);
    }
    const authResponse = (await response.data) as AuthResponse;

    const user: User = {
        email: request.email,
        accessToken: authResponse.accessToken,
        refreshToken: authResponse.refreshToken,
    };
    return [response.status, user] as const;
}

export async function logout() {
    const response = await axios.get(AuthEndpoints.LOGOUT);
    if (response.status !== 200) {
        throw new Error(response.statusText);
    }
    return response.status;
}