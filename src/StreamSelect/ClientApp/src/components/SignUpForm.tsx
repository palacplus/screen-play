
import { useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { set, ZodError } from "zod";
import { useAuth } from "./AuthProvider";
import { LoginSchema, LoginRequest } from "../types/auth";

export default function SignUpForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<ZodError | null>();
    const { token, currentUser, handleLogin, handleLogout, handleExternalLogin } = useAuth();


    function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        const formData: LoginRequest = { email, password, confirmPassword };
        const result = LoginSchema.safeParse(formData);

        if (result.success) {
            setErrors(null);
            // Here you would typically send the form data to your backend
        } else {
            console.log('Form data is invalid. Errors:', result.error);
            setErrors(result.error);
        }
    };

    return (
        <div className="form-container sign-up">
            <form onSubmit={handleSubmit}>
                <h1>Create Account</h1>
                <div className="social-icons">
                    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ""}>
                        <GoogleLogin
                            onSuccess={(credentialResponse: CredentialResponse) => {
                                handleExternalLogin(credentialResponse);
                            }}
                            onError={() => {
                                console.log("Google Login Failed");
                            }}
                            text="signup_with"
                        />
                    </GoogleOAuthProvider>
                </div>
                {/* {this.state.validationErrors.Email ? (
                    this.state.validationErrors.Email.map((error, idx) => <span key={idx}>{error}</span>)
                ) : (
                    <span className="message">or use your email for registration</span>
                )} */}
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                {/* {this.state.validationErrors.Password &&
                    this.state.validationErrors.Password.map((error, idx) => <span key={idx}>{error}</span>)} */}
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {/* {this.state.validationErrors.ConfirmPassword &&
                    this.state.validationErrors.ConfirmPassword.map((error, idx) => <span key={idx}>{error}</span>)} */}
                {errors?.formErrors.fieldErrors.inputValue && (
                    <p className="error">{errors.formErrors.fieldErrors.inputValue.join(', ')}</p>
                )}
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button type="submit">
                    Sign Up
                </button>
            </form>
        </div>
    );

}