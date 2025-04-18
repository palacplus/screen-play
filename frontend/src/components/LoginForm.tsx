import { GoogleLogin } from "@react-oauth/google";
import { FormErrors } from "./FormErrors";
import LoginFormProps from "../types/form";

export default function LoginForm(props: LoginFormProps) {
    const inputStyle = {
        backgroundColor: props.authContext.error || props.errors ? 'red' : '',
        opacity: props.authContext.error || props.errors ? 0.3 : 1.0
    };

    return (
        <div className="form-container sign-in">
            <form>
                {props.authContext.token && (
                    <>
                        <h1>Hello, Friend!</h1>
                        <span className="message">You are signed in</span>
                        <button onReset={props.authContext.handleLogout} type="reset">Sign Out</button>
                    </>
                )}
                {!props.authContext.token && (
                    <>
                        <h1>Sign In</h1>
                        <div className="social-icons">
                            <GoogleLogin
                                onSuccess={props.authContext.handleExternalLogin}
                                onError={() => { console.log("Login Failed"); }}
                            />
                        </div>
                        <input
                            name="email"
                            type="email"
                            data-testid="login-email-input"
                            placeholder="Email"
                            value={props.data.email}
                            onChange={props.onInputChange}
                            style={inputStyle}
                            onClick={props.onReset}
                        />
                        <FormErrors errors={props.errors?.email?._errors} />
                        <input
                            name="password"
                            type="password"
                            data-testid="login-pwd-input"
                            placeholder="Password"
                            value={props.data.password}
                            onChange={props.onInputChange}
                            style={inputStyle}
                            onClick={props.onReset}
                        />
                        <FormErrors errors={props.errors?.password?._errors} />
                        <FormErrors errors={props.authContext.error ? [props.authContext.error] : []} />
                        <a href="#">Forget Your Password?</a>
                        <button onClick={props.onSubmit} type="submit" data-testid="login-button">Sign In</button>
                    </>
                )}
            </form>
        </div>
    );
}