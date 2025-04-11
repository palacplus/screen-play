import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
  useLayoutEffect,
} from 'react';
import axios from 'axios';
import { CredentialResponse } from '@react-oauth/google';
import { refreshToken, login, logout, externalLogin, register } from '../services/api/auth';
import { LoginRequest, TokenRequest } from '../types/auth';
import { usePersistedState } from '../hooks/usePersistedState';
import { User } from '../types/user';

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

export type AuthContextProps = {
  error?: string | null;
  token?: string | null;
  currentUser?: User | null;
  handleLogin: (request: LoginRequest) => Promise<void>;
  handleLogout: () => Promise<void>;
  handleRegister: (request: LoginRequest) => Promise<void>;
  handleExternalLogin: (credentialResponse: CredentialResponse) => Promise<void>;
  setError: React.Dispatch<React.SetStateAction<string | null | undefined>>;
};

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

type AuthProviderProps = PropsWithChildren;

export default function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>();
  const [currentUser, setCurrentUser] = usePersistedState<User | null>('user', null);
  const [error, setError] = useState<string | null>();

  useLayoutEffect(() => {
    const authInterceptor = axios.interceptors.request.use((config) => {
      config.headers.Authorization =
        !config._retry && token
          ? `Bearer ${token}`
          : config.headers.Authorization;
      return config;
    });

    return () => {
      axios.interceptors.request.eject(authInterceptor);
    };
  }, [token]);

  useLayoutEffect(() => {
    const refreshTokenInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 403) {
          try {
            const refreshTokenRequest = {
              email: currentUser?.email,
              refreshToken: currentUser?.refreshToken,
            } as TokenRequest;

            const resp = await refreshToken(refreshTokenRequest);

            setToken(resp[1].token);

            originalRequest.headers.Authorization = `Bearer ${resp[1].token}`;
            originalRequest._retry = true;

            return axios(originalRequest);
          } catch (err) {
            setToken(null);
            setCurrentUser(null);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(refreshTokenInterceptor);
    };
  }, [token]);


  async function handleLogin(request: LoginRequest) {
    try {
      const response = await login(request);
      const user = response[1];
      setToken(user.accessToken);
      setCurrentUser(user);
    } catch (error: any) {
      setError(error.response.data);
      setToken(null);
      setCurrentUser(null);
    }
  }

  async function handleRegister(request: LoginRequest) {
    try {
      const response = await register(request);
      const user = response[1];
      setToken(user.accessToken);
      setCurrentUser(user);
    } catch (error: any) {
      setError(error.response.data);
      setToken(null);
      setCurrentUser(null);
    }
  }

  async function handleLogout() {
    try {
      await logout();
      setToken(null);
      setCurrentUser(null);
    } catch (error: any) {
      setError(error.response.data);
    }
  }

  async function handleExternalLogin(credentialResponse: CredentialResponse) {
    try {
      const response = await externalLogin(credentialResponse);
      const user = response[1];
      setToken(user.accessToken);
      setCurrentUser(user);
    } catch (error: any) {
      setError(error.response.data);
      setToken(null);
      setCurrentUser(null);
    }
  }
  return (
    <AuthContext.Provider
      value={{
        error,
        token,
        currentUser,
        handleLogin,
        handleRegister,
        handleLogout,
        handleExternalLogin,
        setError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used inside of a AuthProvider');
  }
  return context;
}