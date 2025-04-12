import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import LoginForm from "../LoginForm";
import { AuthContextProps } from "../../types/auth";
import LoginFormProps from "../../types/form";

jest.mock("@react-oauth/google", () => ({
    GoogleLogin: jest.fn(() => <div data-testid="google-login">Google Login</div>),
  }));

describe("LoginForm", () => {
  const mockAuthContext: AuthContextProps = {
    token: null,
    error: null,
    currentUser: null,
    handleLogin: jest.fn(),
    handleRegister: jest.fn(),
    handleLogout: jest.fn(),
    handleExternalLogin: jest.fn(),
    setError: jest.fn(),
  };

  const mockProps: LoginFormProps = {
    authContext: mockAuthContext,
    data: { email: "", password: "",  confirmPassword: ""},
    errors: null,
    onSubmit: jest.fn(),
    onInputChange: jest.fn(),
    onReset: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the login form when the user is not signed in", () => {
    render(<LoginForm {...mockProps} />);
    expect(screen.getByRole("button", {"name": "Sign In"})).toBeInTheDocument();
    expect(screen.getByTestId("google-login")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    const signOutButton = screen.queryByRole("button", { name: "Sign Out" });
    expect(signOutButton).toBeNull();
  });

  it("renders the sign-out button when the user is signed in", () => {
    render(<LoginForm {...mockProps} authContext={{ ...mockAuthContext, token: "mock-token" }} />);
    expect(screen.getByText("You are signed in")).toBeInTheDocument();
    expect(screen.getByText("Sign Out")).toBeInTheDocument();
  });

  it("calls onInputChange when email input changes", () => {
    render(<LoginForm {...mockProps} />);
    const emailInput = screen.getByPlaceholderText("Email");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    expect(mockProps.onInputChange).toHaveBeenCalledWith(expect.any(Object));
  });

  it("calls onInputChange when password input changes", () => {
    render(<LoginForm {...mockProps} />);
    const passwordInput = screen.getByPlaceholderText("Password");
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    expect(mockProps.onInputChange).toHaveBeenCalledWith(expect.any(Object));
  });

  it("calls onSubmit when the form is submitted", () => {
    render(<LoginForm {...mockProps} />);
    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    fireEvent.click(submitButton);
    expect(mockProps.onSubmit).toHaveBeenCalled();
  });

  it("calls onReset when the email input is focused", () => {
    render(<LoginForm {...mockProps} />);
    const emailInput = screen.getByPlaceholderText("Email");
    fireEvent.focus(emailInput);
    expect(mockProps.onReset).toHaveBeenCalled();
  });

  it("displays error messages when errors are present", () => {
    const errors = {
      _errors: [],
      email: { _errors: ["Invalid email"] },
      password: { _errors: ["Password is required"] },
    };
    render(<LoginForm {...mockProps} errors={errors} />);
    expect(screen.getByText("Invalid email")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
  });

  it("displays the authContext error message when present", () => {
    render(<LoginForm {...mockProps} authContext={{ ...mockAuthContext, error: "Invalid credentials" }} />);
    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });
});