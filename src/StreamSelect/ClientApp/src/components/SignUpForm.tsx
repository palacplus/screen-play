
import { GoogleLogin } from "@react-oauth/google";
import { FormErrors } from "./FormErrors";
import LoginFormProps from "../types/form"


export default function SignUpForm(props: LoginFormProps) {
    const inputStyle = {
        backgroundColor: props.authContext.error || props.errors ? 'red' : '',
        opacity: props.authContext.error || props.errors ? 0.3 : 1.0
      };
    return (
        <div className="form-container sign-up">s
            <form onSubmit={props.onSubmit}>
                <h1>Create Account</h1>
                <div className="social-icons">
                    <GoogleLogin
                        onSuccess={props.authContext.handleExternalLogin}
                        onError={() => {console.log("Google Login Failed");}}
                        text="signup_with"
                    />
                </div>
                <input 
                    name="email" 
                    type="email" 
                    placeholder="Email" 
                    value={props.data.email} 
                    onChange={props.onInputChange} 
                    style={inputStyle} 
                    onFocus={props.onReset}
                />
                <FormErrors errors={props.errors?.email?._errors} />
                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={props.data.password}
                    onChange={props.onInputChange}
                    style={inputStyle}
                    onFocus={props.onReset}
                />
                <FormErrors errors={props.errors?.password?._errors} />
                <input 
                    name="confirmPassword" 
                    type="password" 
                    placeholder="Confirm Password" 
                    value={props.data.confirmPassword} 
                    onChange={props.onInputChange} 
                    style={inputStyle}
                    onFocus={props.onReset}
                />
                <FormErrors errors={props.errors?.confirmPassword?._errors} />
                <FormErrors errors={props.authContext.error ? [props.authContext.error] : []} />
                <button type="submit">Sign Up</button>
            </form>
        </div>
    );

}