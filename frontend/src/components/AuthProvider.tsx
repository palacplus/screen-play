import {
  createContext,
  PropsWithChildren,
  useContext,
  useState,
  useLayoutEffect,
  useEffect,
} from 'react';
import axios from 'axios';
import { CredentialResponse } from '@react-oauth/google';
import { requestToken, login, logout, externalLogin, register } from '../services/api/auth';
import { LoginRequest, TokenRequest } from '../types/auth';
import { usePersistedState } from '../hooks/usePersistedState';
import { User } from '../types/user';
import { AuthContextProps } from '../types/auth';
import { useNavigate } from 'react-router-dom';

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

type AuthProviderProps = PropsWithChildren;

export default function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = usePersistedState<string | null>("token", null);
  const [currentUser, setCurrentUser] = usePersistedState<User | null>('user', null);
  const [error, setError] = useState<string | null>();
  const nav = useNavigate();
  const maxRetryCount = 10;
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    async function refreshTokenOnMount() {
      if (currentUser?.email && currentUser?.refreshToken && token) {
        try {
          await refreshToken();
        } catch (err) {
          setToken(null);
          setCurrentUser(null);
          nav('/home');
        }
      }
    }
    refreshTokenOnMount();
  }, []);

  useLayoutEffect(() => {
    const authInterceptor = axios.interceptors.request.use((config) => {
      if (config.url?.includes('http')) {
        return config;
      }
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

        if (error.response.status === 401) {
          if (window.location.pathname !== '/home') {
            nav('/home');
          }
          setToken(null);
          setCurrentUser(null);
        }
        
        if (error.response.status === 403) {
          setRetryCount((prev) => prev + 1);

          if (retryCount >= maxRetryCount) {
            throw new Error('Max retry count exceeded');
          }
          try {
            var newToken = await refreshToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
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

  async function refreshToken() {
      const refreshTokenRequest = {
        email: currentUser?.email,
        refreshToken: currentUser?.refreshToken,
      } as TokenRequest;

      const resp = await requestToken(refreshTokenRequest);
      setToken(resp[1].token);

      return resp[1].token;
  }

  async function handleLogin(request: LoginRequest) {
    try {
      const response = await login(request);
      setToken(response[2]);
      setCurrentUser(response[1]);
    } catch (error: any) {
      setError(error.response.data);
      setToken(null);
      setCurrentUser(null);
    }
  }

  async function handleRegister(request: LoginRequest) {
    try {
      const response = await register(request);
      setToken(response[2]);
      setCurrentUser(response[1]);
    } catch (error: any) {
      setError(error.response.data);
      setToken(null);
      setCurrentUser(null);
    }
  }

  async function handleLogout() {
    try {
      if (currentUser?.email) {
        await logout(currentUser.email);
      } else {
        throw new Error('User email is undefined');
      }
    } catch (error: any) {
      setError(error.response.data);
    }
    finally {
      setToken(null);
      setCurrentUser(null);
    }
  }

  async function handleExternalLogin(credentialResponse: CredentialResponse) {
    try {
      const response = await externalLogin(credentialResponse);
      const user = response[1];
      setToken(response[2]);
      setCurrentUser(response[1]);
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