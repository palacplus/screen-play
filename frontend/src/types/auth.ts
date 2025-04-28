import { z } from "zod";
import { User } from "./user";
import { CredentialResponse } from "@react-oauth/google";

export type AuthResponse = {
    token: string;
    refreshToken: string;
    errorMessage: string | null;
}

export type TokenRequest = {
    email: string;
    refreshToken: string;
}

export const LoginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ['confirmPassword'],
});

export type LoginRequest = z.infer<typeof LoginSchema>;

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