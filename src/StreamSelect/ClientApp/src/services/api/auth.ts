import { User } from '@/types/user';
import { AuthResponse, LoginInfo, LoginInfo } from '@/types/auth';
import { AuthEndpoints } from '@/types/endpoints';
import axios from 'axios';

export async function registerUser(LoginInfo: LoginInfo) {
    const response = await axios.post(AuthEndpoints.USER_REGISTER, LoginInfo);
    if (response.status !== 201) {
        throw new Error(response.statusText);
    }
    const user = (await response.data) as User;
    return [response.status, user] as const;
}

export async function registerWithToken(token: string) {
    const response = await axios.post(AuthEndpoints.TOKEN_REGISTER, {
        token: token
    });
    if (response.status !== 201) {
        throw new Error(response.statusText);
    }
    const user = (await response.data) as User;
    return [response.status, { token, user: user }] as const;
}

export async function refreshToken(token: string) {
    const response = await axios.post(AuthEndpoints.REFRESH_TOKEN, {
        token: token
    });
    if (response.status !== 200) {
        throw new Error(response.statusText);
    }
    const authResponse = (await response.data) as AuthResponse;
    return [response.status, authResponse] as const;
}

export async function login(user: LoginInfo) {
    const response = await axios.post(AuthEndpoints.LOGIN, user);
    if (response.status !== 200) {
        throw new Error(response.statusText);
    }
    const authResponse = (await response.data) as AuthResponse;
    return [response.status, authResponse] as const;
}
