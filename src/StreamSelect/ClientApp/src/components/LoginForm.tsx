
import { useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

export default function RegisterForm() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);



    return (
        <div className="form-container sign-up">
            <form>
                <h1>Create Account</h1>
                <div className="social-icons">
                    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ""}>
                        <GoogleLogin
                            onSuccess={(credentialResponse: CredentialResponse) => {
                                this.submitTokenRegistration(credentialResponse);
                            }}
                            onError={() => {
                                console.log("Login Failed");
                            }}
                            text="signup_with"
                        />
                    </GoogleOAuthProvider>
                </div>
                {this.state.validationErrors.Email ? (
                    this.state.validationErrors.Email.map((error, idx) => <span key={idx}>{error}</span>)
                ) : (
                    <span className="message">or use your email for registration</span>
                )}
                <input type="email" placeholder="Email" value={this.state.email} onChange={this.changeEmailInput} />
                {this.state.validationErrors.Password &&
                    this.state.validationErrors.Password.map((error, idx) => <span key={idx}>{error}</span>)}
                <input
                    type="password"
                    placeholder="Password"
                    value={this.state.password}
                    onChange={this.changePasswordInput}
                />
                {this.state.validationErrors.ConfirmPassword &&
                    this.state.validationErrors.ConfirmPassword.map((error, idx) => <span key={idx}>{error}</span>)}
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={this.state.confirmPassword}
                    onChange={this.changeConfirmPasswordInput}
                />
                <button type="submit" onClick={this.submitRegister}>
                    Sign Up
                </button>

            </form>
        </div>
    );

}