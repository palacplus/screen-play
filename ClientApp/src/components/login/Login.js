import React, { Component } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleLogin } from "@react-oauth/google";
import "./Login.css";

export class Login extends Component {
  static googleAuthClientID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      email: "",
      password: "",
      confirmPassword: "",
      errorMessage: null,
      registered: false,
      validationErrors: {},
    };
  }

  render() {
    return (
      <GoogleOAuthProvider clientId={Login.googleAuthClientID}>
        <div className="login-container" id="login-container">
          <div className="form-container sign-up">
            <form>
              <h1>Create Account</h1>
              <div className="social-icons">
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    this.submitTokenRegistration(credentialResponse);
                  }}
                  onError={() => {
                    console.log("Login Failed");
                  }}
                />
              </div>
              {this.state.validationErrors.Email ? (
                this.state.validationErrors.Email.map((error, idx) => <span key={idx}>{error}</span>)
              ) : (
                <span>or use your email for registeration</span>
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
          <div className="form-container sign-in">
            <form>
              <h1>Sign In</h1>
              <div className="social-icons">
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    this.submitTokenRegistration(credentialResponse);
                  }}
                  onError={() => {
                    console.log("Login Failed");
                  }}
                />
              </div>
              <span>or use your email</span>
              <input type="email" placeholder="Email" />
              <input type="password" placeholder="Password" />
              <a href="#">Forget Your Password?</a>
              <button>Sign In</button>
            </form>
          </div>
          <div className="toggle-container">
            <div className="toggle">
              <div className="toggle-panel toggle-left">
                <h1>Welcome Back!</h1>
                <p>Enter your personal details to use all of site features</p>
                <button className="hidden" id="login" onClick={this.switchToLogin}>
                  Sign In
                </button>
              </div>
              <div className="toggle-panel toggle-right">
                <h1>Hello, Friend!</h1>
                <p>Register with your personal details to use all of site features</p>
                <button className="hidden" id="register" onClick={this.switchToRegister}>
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </GoogleOAuthProvider>
    );
  }

  switchToRegister = async (event) => {
    const container = document.getElementById("login-container");
    container.classList.add("active");
  };

  switchToLogin = async (event) => {
    const container = document.getElementById("login-container");
    container.classList.remove("active");
  };

  changeEmailInput = (event) => {
    this.setState({ email: event.target.value });
  };
  changePasswordInput = (event) => {
    this.setState({ password: event.target.value });
  };
  changeConfirmPasswordInput = (event) => {
    this.setState({ confirmPassword: event.target.value });
  };

  submitTokenRegistration = async (credentialsResponse) => {
    this.setState({ loading: true });
    console.log(this.state);

    const requestOptions = {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Token: credentialsResponse.credential,
      }),
    };

    await fetch("api/account/register/token", requestOptions)
      .then((resp) => {
        if (resp.status !== 200) {
          throw new Error(resp.statusText);
        }
      })
      .then(() => {
        console.log("User Added!");
        this.setState({ registered: true });
      })
      .catch((error) => {
        console.error(error.message);
        this.setState({ errorMessage: error.message });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  submitRegister = async (event) => {
    event.preventDefault();
    this.setState({ loading: true });

    const requestOptions = {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Email: this.state.email,
        Password: this.state.password,
        ConfirmPassword: this.state.confirmPassword,
      }),
    };

    await fetch("api/account/register", requestOptions)
      .then((resp) => {
        if (resp.status !== 200 && resp.status !== 400) {
          throw new Error(resp.statusText);
        }
        if (resp.status === 400) {
          this.setValidationError(resp);
          throw new Error("Invalid input");
        }
      })
      .then(() => {
        console.log("User Added!");
        this.setState({ registered: true });
      })
      .catch((error) => {
        console.error(error.message);
        this.setState({ errorMessage: error.message });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  setValidationError = async (response) => {
    let data = await response.json();
    console.debug(data);
    this.setState({
      validationErrors: {
        Email: data.errors.Email,
        Password: data.errors.Password,
        ConfirmPassword: data.errors.ConfirmPassword,
      },
    });
  };
}
