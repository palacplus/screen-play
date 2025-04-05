import React, { Component } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleLogin } from "@react-oauth/google";
import authService from "../../components/api-authorization/AuthorizeService";
import "./LoginPage.css";

export class LoginPage extends Component {
  static googleAuthClientID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      email: "",
      password: "",
      confirmPassword: "",
      persistLogin: false,
      errorMessage: null,
      registered: false,
      loggedIn: false,
      validationErrors: {},
      userName: null,
    };
  }

  render() {
    return (
      <GoogleOAuthProvider clientId={LoginPage.googleAuthClientID}>
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
                  text="signup_with"
                />
              </div>
              {this.state.validationErrors.Email ? (
                this.state.validationErrors.Email.map((error, idx) => <span key={idx}>{error}</span>)
              ) : (
                <span className="message">or use your email for registeration</span>
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
              <h1 hidden={this.state.loggedIn}>Sign In</h1>
              <h1 hidden={!this.state.loggedIn}>Hello, Friend!</h1>
              <div className="social-icons" hidden={this.state.loggedIn}>
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
                <span className="message" hidden={this.state.loggedIn}>
                  or use your email
                </span>
              )}
              <span className="message" hidden={!this.state.loggedIn}>
                You are signed in
              </span>
              <input
                type="email"
                placeholder="Email"
                value={this.state.email}
                onChange={this.changeEmailInput}
                hidden={this.state.loggedIn}
              />
              {this.state.validationErrors.Password &&
                this.state.validationErrors.Password.map((error, idx) => <span key={idx}>{error}</span>)}
              <input
                type="password"
                placeholder="Password"
                value={this.state.password}
                onChange={this.changePasswordInput}
                hidden={this.state.loggedIn}
              />
              <a href="#" hidden={this.state.loggedIn}>
                Forget Your Password?
              </a>
              <button type="submit" onClick={this.submitLogin} hidden={this.state.loggedIn}>
                Sign In
              </button>
              <button type="submit" onClick={this.submitLogout} hidden={!this.state.loggedIn}>
                Sign Out
              </button>
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
                <h1>New Here?</h1>
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

  componentDidMount() {
    this._subscription = authService.subscribe(() => this.populateState());
    this.populateState();
  }

  componentWillUnmount() {
    authService.unsubscribe(this._subscription);
  }

  async populateState() {
    const [isAuthenticated, user] = await Promise.all([authService.isAuthenticated(), authService.getUser()]);
    this.setState({
      loggedIn: isAuthenticated,
      userName: user && user.name,
    });
  }

  resetState = async () => {
    this.setState({
      loading: false,
      email: "",
      password: "",
      confirmPassword: "",
      persistLogin: false,
      errorMessage: null,
      registered: false,
      validationErrors: {},
    });
  };

  switchToRegister = async (event) => {
    event.preventDefault();
    await this.resetState();
    const container = document.getElementById("login-container");
    container.classList.add("active");
  };

  switchToLogin = async (event) => {
    event.preventDefault();
    await this.resetState();
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
      method: "POST",
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
    this.setState({ loading: true, validationErrors: {} });

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

  submitLogin = async (event) => {
    event.preventDefault();
    this.setState({ loading: true, validationErrors: {} });

    const requestOptions = {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Email: this.state.email,
        Password: this.state.password,
        RememberMe: this.state.persistLogin,
      }),
    };

    await fetch("api/account/login", requestOptions)
      .then((resp) => {
        if (resp.status !== 200 && resp.status !== 400) {
          throw new Error(resp.statusText);
        }
        if (resp.status === 400) {
          this.setValidationError(resp);
          throw new Error("Invalid input");
        }
        return resp.json();
      })
      .then((data) => {
        console.log("User Logged In!");
        this.setState({ loggedIn: true });
      })
      .catch((error) => {
        console.error(error.message);
        this.setState({ errorMessage: error.message });
      })
      .finally(() => {
        this.setState({ loading: false });
      });

    await authService.signIn(null);
  };

  submitLogout = async (event) => {
    event.preventDefault();
    this.setState({ loading: true, validationErrors: {} });

    await fetch("api/account/logout")
      .then((resp) => {
        if (resp.status !== 200) {
          throw new Error(resp.statusText);
        }
      })
      .then(() => {
        console.log("User Logged Out");
        this.setState({ loggedIn: false });
      })
      .catch((error) => {
        console.error(error.message);
        this.setState({ errorMessage: error.message });
      })
      .finally(() => {
        this.setState({ loading: false, password: null });
      });

    await authService.signOut(null);
  };
}
