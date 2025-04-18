import { GoogleOAuthProvider } from "@react-oauth/google";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignUpForm";
import { LoginSchema, LoginRequest } from "../types/auth";
import { ZodFormattedError } from "zod";
import { useAuth } from "./AuthProvider";
import { AuthContextProps } from "../types/auth";
import LoadingOverlay from "./LoadingOverlay";

import "./LoginPanel.css";

export default function LoginPanel() {
  const [activeForm, setActiveForm] = useState("login");
  const initialFormData = {
    email: "",
    password: "",
    confirmPassword: "",
  };
  const [formData, setFormData] = useState<LoginRequest>(initialFormData);
  const [formErrors, setFormErrors] = useState<ZodFormattedError<LoginRequest> | null>(null);
  const[loading, setLoading] = useState<boolean>(false);
  const auth: AuthContextProps = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.token) {
      navigate("/home");
    }
  }, [auth.token, navigate]);

  function handleReset() {
    if (formErrors || auth.error) {
      setFormData(initialFormData);
      setFormErrors(null);
      auth.setError(null);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true)
    // await new Promise((resolve) => setTimeout(resolve, 3000));
    try{
      const result = LoginSchema.safeParse(formData);
      if (result.success) {
        if (activeForm === "login") {
          auth.handleLogin(result.data);
        } else {
          auth.handleRegister(result.data);
        }
        setFormErrors(null);
      } else {
        console.error("Form data is invalid. Errors:", result.error.flatten());
        auth.setError(null);
        setFormErrors(result.error.format());
      }
    }
    finally {
      setLoading(false)
    }
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    if (activeForm === "login" && name === "password") {
      setFormData((prevState) => ({
        ...prevState,
        confirmPassword: value,
      }));
    }
  }

  function switchForm(event: React.MouseEvent) {
    event.preventDefault();
    const loginContainer = document.getElementById("login-container");
    if (loginContainer) {
      if (activeForm === "signup") {
        setActiveForm("login");
        loginContainer.classList.remove("active");
      } else {
        setActiveForm("signup");
        loginContainer.classList.add("active");
      }
    }
    setFormData(initialFormData);
  }

  return (
    <div className="login" id="login-container">
      <LoadingOverlay isLoading={loading} />
      <GoogleOAuthProvider clientId="1001545826720-tj9qj1r0uko12j8j5c0osfv9485vbgve">
        <SignUpForm
          data={formData}
          errors={formErrors}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          onReset={handleReset}
          authContext={auth}
        />
        <LoginForm
          data={formData}
          errors={formErrors}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          onReset={handleReset}
          authContext={auth}
        />
      </GoogleOAuthProvider>
      <div className="toggle-container">
        <div className="toggle">
          <div className="toggle-panel toggle-left">
            <h1>Have an Account?</h1>
            <button data-testid="login-toggle" className="hidden" id="login" onClick={switchForm}>
              Sign In
            </button>
          </div>
          <div className="toggle-panel toggle-right">
            <h1>New Here?</h1>
            <button data-testid="register-toggle" className="hidden" id="register" onClick={switchForm}>
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
