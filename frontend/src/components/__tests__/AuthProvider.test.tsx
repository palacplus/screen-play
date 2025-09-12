import { render, screen, act } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";
import MockAdapter from "axios-mock-adapter";
import AuthProvider, { useAuth } from "../AuthProvider";
import { CredentialResponse } from "@react-oauth/google";

const mockAxios = new MockAdapter(axios);

describe("AuthProvider", () => {
    const mockNavigate = jest.fn();
    jest.mock("react-router-dom", () => ({
        ...jest.requireActual("react-router-dom"),
        useNavigate: () => mockNavigate,
    }));
    const TestComponent = () => {
        const auth = useAuth();

        return (
            <div>
                <button onClick={() => auth.handleLogin({ email: "test@example.com", password: "password", confirmPassword: "" })}>
                    Login
                </button>
                <button onClick={() => auth.handleRegister({ email: "test@example.com", password: "password", confirmPassword: "password" })}>
                    Register
                </button>
                <button onClick={auth.handleLogout}>Logout</button>
                <button
                    onClick={() =>
                        auth.handleExternalLogin({ credential: "mock-credential" } as CredentialResponse)
                    }
                >
                    External Login
                </button>
                <div data-testid="token">{auth.token}</div>
                <div data-testid="refreshToken">{auth.currentUser?.refreshToken}</div>
                <div data-testid="error">{auth.error}</div>
                <button onClick={() => axios.get("/api/some-data")}>Get Data</button>
            </div>
        );
    };
    const renderComponent = () => {
        render(
          <MemoryRouter>
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
          </MemoryRouter>
        );
      };

    beforeEach(() => {
        mockAxios.reset();
        // Clear any persisted state
        localStorage.clear();
        sessionStorage.clear();
    });

    it("handles login successfully", async () => {
        const mockResponse = { token: "mock-token", refreshToken: "mock-refresh-token", errorMessage: null };
        mockAxios.onPost("/api/auth/login").reply(200, mockResponse);
        // Mock the automatic token refresh that happens after login
        mockAxios.onPost("/api/auth/refresh-token").reply(200, mockResponse);

        renderComponent();

        const loginButton = screen.getByText("Login");

        await act(async () => {
            loginButton.click();
        });

        // Expect 2 POST requests: 1 for login, 1 for automatic token refresh
        expect(mockAxios.history.post.length).toBe(2);
        expect(screen.getByTestId("token").textContent).toBe("mock-token");
        expect(screen.getByTestId("refreshToken").textContent).toBe("mock-refresh-token");
        expect(screen.getByTestId("error").textContent).toBe("");
    });

    it("handles login failure", async () => {
        mockAxios.onPost("/api/auth/login").reply(401, "Invalid credentials");

        renderComponent();

        const loginButton = screen.getByText("Login");

        await act(async () => {
            loginButton.click();
        });

        // Only 1 POST request since login failed (no token to refresh)
        expect(mockAxios.history.post.length).toBe(1);
        expect(screen.getByTestId("token").textContent).toBe("");
        expect(screen.getByTestId("refreshToken").textContent).toBe("");
        expect(screen.getByTestId("error").textContent).toBe("Invalid credentials");
    });

    it("handles registration successfully", async () => {
        const mockResponse = { token: "mock-token", refreshToken: "mock-refresh-token", errorMessage: null };
        mockAxios.onPost("/api/auth/register").reply(201, mockResponse);
        // Mock the automatic token refresh that happens after registration
        mockAxios.onPost("/api/auth/refresh-token").reply(200, mockResponse);

        renderComponent();

        const registerButton = screen.getByText("Register");

        await act(async () => {
            registerButton.click();
        });

        // Expect 2 POST requests: 1 for register, 1 for automatic token refresh
        expect(mockAxios.history.post.length).toBe(2);
        expect(screen.getByTestId("token").textContent).toBe("mock-token");
        expect(screen.getByTestId("error").textContent).toBe("");
    });

    it("handles logout successfully", async () => {
        const mockLoginResponse = { token: "mock-token", refreshToken: "mock-refresh-token", errorMessage: null };
        mockAxios.onPost("/api/auth/login").reply(200, mockLoginResponse);
        mockAxios.onPost("/api/auth/refresh-token").reply(200, mockLoginResponse);
        mockAxios.onGet("/api/auth/logout").reply(200);

        renderComponent();

        const loginButton = screen.getByText("Login");
        await act(async () => {
            loginButton.click();
        });

        expect(screen.getByTestId("token").textContent).toBe("mock-token");

        const logoutButton = screen.getByText("Logout");
        await act(async () => {
            logoutButton.click();
        });

        expect(mockAxios.history.get.length).toBe(1);
        expect(screen.getByTestId("token").textContent).toBe("");
        expect(screen.getByTestId("refreshToken").textContent).toBe("");
        expect(screen.getByTestId("error").textContent).toBe("");
    });

    it("handles external login successfully", async () => {
        // Arrange: Mock a real JWT token with an email claim
        const mockJwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20ifQ.sflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
        const mockResponse = { token: mockJwtToken, refreshToken: "mock-refresh-token", errorMessage: null };
        mockAxios.onPost("/api/auth/external-login").reply(200, mockResponse);
        // Mock the automatic token refresh that happens after external login
        mockAxios.onPost("/api/auth/refresh-token").reply(200, mockResponse);

        renderComponent();

        // Act: Trigger the external login
        const externalLoginButton = screen.getByText("External Login");
        await act(async () => {
            externalLoginButton.click();
        });

        // Assert: Expect 2 POST requests: 1 for external login, 1 for automatic token refresh
        expect(mockAxios.history.post.length).toBe(2);
        expect(screen.getByTestId("token").textContent).toBe(mockJwtToken);
        expect(screen.getByTestId("refreshToken").textContent).toBe("mock-refresh-token");
        expect(screen.getByTestId("error").textContent).toBe("");
    });

    it("throws an error when useAuth is used outside of AuthProvider", () => {
        const TestComponentWithoutProvider = () => {
            expect(() => useAuth()).toThrow("useAuth must be used inside of a AuthProvider");
            return null;
        };

        render(<TestComponentWithoutProvider />);
    });

    it("intercepts 403 Forbidden response", async () => {
        // Arrange: Mock login, refresh, a getData responses
        const mockLoginResponse = { token: "mock-token", refreshToken: "mock-refresh-token", errorMessage: null };
        const mockRefreshResponse = { token: "new-token", refreshToken: mockLoginResponse.refreshToken, errorMessage: null };
        
        mockAxios.onPost("/api/auth/login").reply(200, mockLoginResponse);
        // Mock the automatic refresh that happens after login
        mockAxios.onPost("/api/auth/refresh-token").reply(200, mockRefreshResponse);

        // Mock 403 then success for the data request
        mockAxios.onGet("/api/some-data").replyOnce(403).onGet("/api/some-data").replyOnce(200);
        
        renderComponent();

        // Act: Request initial user login and send a get data request with bearer token
        const loginButton = screen.getByText("Login");
        await act(async () => {
            loginButton.click();
        });
        
        // After login and auto-refresh, token should be the refreshed token
        expect(screen.getByTestId("token").textContent).toBe(mockRefreshResponse.token);
        expect(screen.getByTestId("refreshToken").textContent).toBe(mockLoginResponse.refreshToken);

        const getDataButton = screen.getByText("Get Data");
        await act(async () => {
            getDataButton.click();
        });

        // Assert: Verify the GET request was made 2 times and the token was refreshed again
        expect(mockAxios.history.get.length).toBe(2);
        expect(mockAxios.history.post.length).toBe(3); // login + auto-refresh + 403-retry-refresh
        expect(screen.getByTestId("token").textContent).toBe(mockRefreshResponse.token);
        expect(screen.getByTestId("refreshToken").textContent).toBe(mockLoginResponse.refreshToken);
        expect(screen.getByTestId("error").textContent).toBe("");
    });
});