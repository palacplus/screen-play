import { GoogleLogin } from "@react-oauth/google";
import { FormErrors } from "./FormErrors";
import LoginFormProps from "../types/form";
import LoadingOverlay from "./LoadingOverlay";

export default function LoginForm(props: LoginFormProps) {
    const inputClassName = props.authContext.error || props.errors ? "error" : "";
    return (
        <div className="form-container sign-in">
            {props.active && <LoadingOverlay isLoading={props.loading} />}
            <form>
                {props.authContext.token && (
                    <>
                        <h1>Hello, Friend!</h1>
                        <span className="message">You are signed in</span>
                        <button onClick={props.authContext.handleLogout} type="reset">Sign Out</button>
                    </>
                )}
                {!props.authContext.token && (
                    <>
                        <h1>Sign In</h1>
                        <div className="social-icons">
                            <GoogleLogin
                                onSuccess={props.authContext.handleExternalLogin}
                                onError={() => { console.error("Login Failed"); }}
                                theme="filled_blue"
                                shape="pill"
                            />
                        </div>
                        <input
                            name="email"
                            type="email"
                            data-testid="login-email-input"
                            placeholder="Email"
                            value={props.data.email}
                            onChange={props.onInputChange}
                            className={inputClassName}
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
                            className={inputClassName}
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