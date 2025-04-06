import { User } from '@/types/user';
import { AuthResponse, UserInfo, NewUserInfo } from '@/types/auth';
import { AuthEndpoints } from '@/types/endpoints';
import axios from 'axios';


export async function registerWithToken(token: string) {
    const response = await axios.post(AuthEndpoints.TOKEN_REGISTER, {
        token: token
    });
    if (response.status !== 201) {
        throw new Error(response.statusText);
    }
    const newUser = (await response.data) as User;
    return [response.status, { token, user: newUser }] as const;
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

export async function login(user: UserInfo) {
    const response = await axios.post(AuthEndpoints.LOGIN, user);
    if (response.status !== 200) {
        throw new Error(response.statusText);
    }
    const authResponse = (await response.data) as AuthResponse;
    return [response.status, authResponse] as const;
}
