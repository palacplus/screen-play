
import { GoogleLogin } from "@react-oauth/google";
import { FormErrors } from "./FormErrors";
import LoginFormProps from "../types/form"


export default function LoginForm(props: LoginFormProps) {
    const inputStyle = {
        backgroundColor: props.authContext.error || props.errors ? 'red' : '',
        opacity: props.authContext.error || props.errors ? 0.3 : 1.0
      };
    const textStyle = {
        color: props.authContext.error || props.errors ? 'red' : ''
    };
    return (
        <div className="form-container sign-in">
            <form onSubmit={props.onSubmit} onReset={props.authContext.handleLogout}>
                {!props.authContext.token && (<h1>Sign In</h1>)}
                {props.authContext.error && (<h1>Hello, Friend!</h1>)}
                {!props.authContext.token && (<div className="social-icons">
                    <GoogleLogin 
                        onSuccess={props.authContext.handleExternalLogin} 
                        onError={() => { console.log("Login Failed"); }} 
                    />
                </div>)}
                {props.authContext.token && (<span className="message">
                    You are signed in
                </span>)}
                {!props.authContext.token && (
                    <>
                        <input 
                            name="email" 
                            type="email" 
                            placeholder="Email" 
                            value={props.data.email} 
                            onChange={props.onInputChange} 
                            style={inputStyle}
                            onFocus={props.onReset}
                        />
                        <FormErrors errors={props.errors?.email?._errors}/>
                        <input 
                            name="password" 
                            type="password" 
                            placeholder="Password" 
                            value={props.data.password} 
                            onChange={props.onInputChange} 
                            style={inputStyle}
                        />
                        <FormErrors errors={props.errors?.password?._errors}/>
                        <FormErrors errors={props.authContext.error ? [props.authContext.error] : []} />
                        <a href="#">Forget Your Password?</a>
                        <button type="submit">Sign In</button>
                    </>
                )}
                {props.authContext.token && <button type="reset">Sign Out</button>}
            </form>
        </div>
    );
}