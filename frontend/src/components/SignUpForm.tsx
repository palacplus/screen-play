
import { GoogleLogin } from "@react-oauth/google";
import { FormErrors } from "./FormErrors";
import LoginFormProps from "../types/form"
import LoadingOverlay from "./LoadingOverlay";


export default function SignUpForm(props: LoginFormProps) {
    const inputClassName = props.authContext.error || props.errors ? "error" : "";
    return (
        <div className="form-container sign-up">
            {props.active && <LoadingOverlay isLoading={props.loading} />}
            <form>
                {props.authContext.token && (
                    <>
                        <h1>Success!</h1>
                        <span className="message">You are signed in</span>
                        <button data-testid="sign-out-button" onClick={props.authContext.handleLogout} type="reset">Sign Out</button>
                    </>
                )}
                {!props.authContext.token && (
                    <>
                        <h1>Create Account</h1>
                        <div className="social-icons">
                            <GoogleLogin
                                onSuccess={props.authContext.handleExternalLogin}
                                onError={() => { console.error("Google Login Failed"); }}
                                text="signup_with"
                            />
                        </div>
                        <input
                            name="email"
                            type="email"
                            placeholder="Email"
                            data-testid="register-email-input"
                            value={props.data.email}
                            onChange={props.onInputChange}
                            className={inputClassName}
                            onClick={props.onReset}
                        />
                        <FormErrors errors={props.errors?.email?._errors} />
                        <input
                            name="password"
                            type="password"
                            placeholder="Password"
                            data-testid="register-pwd-input"
                            value={props.data.password}
                            onChange={props.onInputChange}
                            className={inputClassName}
                            onClick={props.onReset}
                        />
                        <FormErrors errors={props.errors?.password?._errors} />
                        <input
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirm Password"
                            data-testid="register-conf-pwd-input"
                            value={props.data.confirmPassword}
                            onChange={props.onInputChange}
                            className={inputClassName}
                            onClick={props.onReset}
                        />
                        <FormErrors errors={props.errors?.confirmPassword?._errors} />
                        <FormErrors errors={props.authContext.error ? [props.authContext.error] : []} />
                        <button onClick={props.onSubmit} type="submit" data-testid="register-button" >Sign Up</button>
                    </>)}
            </form>
        </div>
    );

}