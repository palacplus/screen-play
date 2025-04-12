import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import SignUpForm from "../SignUpForm";
import { AuthContextProps } from "../../types/auth";
import LoginFormProps from "../../types/form";

jest.mock("@react-oauth/google", () => ({
  GoogleLogin: jest.fn(() => <div data-testid="google-login">Google Login</div>),
}));

describe("SignUpForm", () => {
  const mockAuthContext: AuthContextProps = {
    token: null,
    error: null,
    handleLogin: jest.fn(),
    handleRegister: jest.fn(),
    handleLogout: jest.fn(),
    handleExternalLogin: jest.fn(),
    setError: jest.fn(),
  };

  const mockProps: LoginFormProps = {
    authContext: mockAuthContext,
    data: { email: "", password: "", confirmPassword: "" },
    errors: null,
    onSubmit: jest.fn(),
    onInputChange: jest.fn(),
    onReset: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the sign-up form", () => {
    render(<SignUpForm {...mockProps} />);
    expect(screen.getByText("Create Account")).toBeInTheDocument();
    expect(screen.getByTestId("google-login")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Confirm Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeInTheDocument();
  });

  it("calls onInputChange when email input changes", () => {
    render(<SignUpForm {...mockProps} />);
    const emailInput = screen.getByPlaceholderText("Email");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    expect(mockProps.onInputChange).toHaveBeenCalledWith(expect.any(Object));
  });

  it("calls onInputChange when password input changes", () => {
    render(<SignUpForm {...mockProps} />);
    const passwordInput = screen.getByPlaceholderText("Password");
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    expect(mockProps.onInputChange).toHaveBeenCalledWith(expect.any(Object));
  });

  it("calls onInputChange when confirmPassword input changes", () => {
    render(<SignUpForm {...mockProps} />);
    const confirmPasswordInput = screen.getByPlaceholderText("Confirm Password");
    fireEvent.change(confirmPasswordInput, { target: { value: "password123" } });
    expect(mockProps.onInputChange).toHaveBeenCalledWith(expect.any(Object));
  });

  it("calls onSubmit when the form is submitted", () => {
    render(<SignUpForm {...mockProps} />);
    const submitButton = screen.getByRole('button', { name: 'Sign Up' });
    fireEvent.click(submitButton);
    expect(mockProps.onSubmit).toHaveBeenCalled();
  });

  it("calls onReset when the email input is focused", () => {
    render(<SignUpForm {...mockProps} />);
    const emailInput = screen.getByPlaceholderText("Email");
    fireEvent.focus(emailInput);
    expect(mockProps.onReset).toHaveBeenCalled();
  });

  it("displays error messages when errors are present", () => {
    const errors = {
        _errors: [],
        email: { _errors: ["Invalid email"] },
        password: { _errors: ["Password is required"] },
        confirmPassword: { _errors: ["Passwords do not match"]}
      };
    render(<SignUpForm {...mockProps} errors={errors} />);
    expect(screen.getByText("Invalid email")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
    expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
  });

  it("displays the authContext error message when present", () => {
    render(<SignUpForm {...mockProps} authContext={{ ...mockAuthContext, error: "Registration failed" }} />);
    expect(screen.getByText("Registration failed")).toBeInTheDocument();
  });
});