import { z } from "zod";

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
    message: "Passwords don't match",
    path: ['confirmPassword'], // Indicate which field the error belongs to
});

export type LoginRequest = z.infer<typeof LoginSchema>;