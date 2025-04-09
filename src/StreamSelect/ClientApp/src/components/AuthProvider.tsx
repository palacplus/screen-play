// import { refreshToken, login } from '@/services/api/auth';
// import { User } from '@/types/user';
// import {
//   createContext,
//   PropsWithChildren,
//   useContext,
//   useEffect,
//   useLayoutEffect,
//   useState,
// } from 'react';
// import axios from 'axios';

// type AuthContext = {
//   token?: string | null;
//   currentUser?: User | null;
//   handleLogin: () => Promise<void>;
//   handleLogout: () => Promise<void>;
// };

// const AuthContext = createContext<AuthContext | undefined>(undefined);

// type AuthProviderProps = PropsWithChildren;

// export default function AuthProvider({ children }: AuthProviderProps) {
//   const [token, setToken] = useState<string | null>();
//   const [currentUser, setCurrentUser] = useState<User | null>();

//   // useEffect(() => {
//   //   async function fetchUser() {
//   //     try {
//   //       const response = await getUser();

//   //       const { token, user } = response[1];

//   //       setToken(token);
//   //       setCurrentUser(user);
//   //     } catch {
//   //       setToken(null);
//   //       setCurrentUser(null);
//   //     }
//   //   }

//   //   fetchUser();
//   // }, []);

//   useLayoutEffect(() => {
//     const authInterceptor = axios.interceptors.request.use((config) => {
//       config.headers.Authorization =
//         !config._retry && token
//           ? `Bearer ${token}`
//           : config.headers.Authorization;
//       return config;
//     });

//     return () => {
//       axios.interceptors.request.eject(authInterceptor);
//     };
//   }, [token]);

//   useLayoutEffect(() => {
//     const refreshTokenInterceptor = axios.interceptors.response.use(
//       (response) => response,
//       async (error) => {
//         const originalRequest = error.config;
//         if (error.response.status === 403) {
//           try {
//             const resp = await refreshToken(token);

//             setToken(resp[1].token);

//             originalRequest.headers.Authorization = `Bearer ${resp[1].token}`;
//             originalRequest._retry = true;

//             return axios(originalRequest);
//           } catch (err) {
//             setToken(null);
//             setCurrentUser(null);
//           }
//         }
//           return Promise.reject(error);
//         }
//       );
  
//       return () => {
//         axios.interceptors.response.eject(refreshTokenInterceptor);
//       };
//     }, [token]);


//   async function handleLogin(user: LoginRequest) {
//     try {
//       const response = await login(user: LoginRequest);

//       const { token, user } = response[1];

//       setToken(token);
//       setCurrentUser(user);
//     } catch {
//       setToken(null);
//       setCurrentUser(null);
//     }
//   }

//   async function handleLogout() {
//     setToken(null);
//     setCurrentUser(null);
//   }

//   return (
//     <AuthContext.Provider
//       value={{
//         token,
//         currentUser,
//         handleLogin,
//         handleLogout,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);

//   if (context === undefined) {
//     throw new Error('useAuth must be used inside of a AuthProvider');
//   }

//   return context;
// }