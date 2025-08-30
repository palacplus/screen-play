import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ThemeToggle from "../ThemeToggle";

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

global.requestAnimationFrame = jest.fn((callback) => {
  callback(0);
  return 0;
});

describe("ThemeToggle Component", () => {
  let mockSetProperty: jest.Mock;
  let mockSetAttribute: jest.Mock;

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();

    mockSetProperty = jest.fn();
    Object.defineProperty(document.documentElement, "style", {
      value: {
        setProperty: mockSetProperty,
      },
      writable: true,
    });

    mockSetAttribute = jest.fn();
    Object.defineProperty(document.body, "setAttribute", {
      value: mockSetAttribute,
      writable: true,
    });
  });

  test("renders theme toggle button", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /toggle theme/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-label", "Toggle theme");
  });

  test("defaults to dark mode when no saved theme", () => {
    localStorageMock.getItem.mockReturnValue(null);
    render(<ThemeToggle />);
    
    const button = screen.getByRole("button");
    expect(button).toHaveClass("dark");
    expect(button).toHaveAttribute("title", "Switch to light mode");
    expect(screen.getByText("🌙")).toBeInTheDocument();
  });

  test("loads saved theme from localStorage", () => {
    localStorageMock.getItem.mockReturnValue("light");
    render(<ThemeToggle />);
    
    const button = screen.getByRole("button");
    expect(button).toHaveClass("light");
    expect(button).toHaveAttribute("title", "Switch to dark mode");
    expect(screen.getByText("☀️")).toBeInTheDocument();
  });

  test("applies dark theme CSS properties on initialization", () => {
    localStorageMock.getItem.mockReturnValue("dark");
    render(<ThemeToggle />);
    
    expect(mockSetProperty).toHaveBeenCalledWith("--bg-primary", "#0f0f0f");
    expect(mockSetProperty).toHaveBeenCalledWith("--text-primary", "#ffffff");
    expect(mockSetProperty).toHaveBeenCalledWith("--accent-color", "#0ea5e9");
    expect(mockSetAttribute).toHaveBeenCalledWith("data-theme", "dark");
  });

  test("applies light theme CSS properties when saved", () => {
    localStorageMock.getItem.mockReturnValue("light");
    render(<ThemeToggle />);
    
    expect(mockSetProperty).toHaveBeenCalledWith("--bg-primary", "#ffffff");
    expect(mockSetProperty).toHaveBeenCalledWith("--text-primary", "#0f172a");
    expect(mockSetProperty).toHaveBeenCalledWith("--accent-color", "#0ea5e9");
    expect(mockSetAttribute).toHaveBeenCalledWith("data-theme", "light");
  });

  test("toggles from dark to light mode", async () => {
    localStorageMock.getItem.mockReturnValue("dark");
    render(<ThemeToggle />);
    
    const button = screen.getByRole("button");
    expect(button).toHaveClass("dark");
    
    fireEvent.click(button);
    
    expect(button).toHaveClass("light");
    expect(button).toHaveAttribute("title", "Switch to dark mode");
    expect(screen.getByText("☀️")).toBeInTheDocument();
    expect(localStorageMock.setItem).toHaveBeenCalledWith("theme", "light");
  });

  test("toggles from light to dark mode", async () => {
    localStorageMock.getItem.mockReturnValue("light");
    render(<ThemeToggle />);
    
    const button = screen.getByRole("button");
    expect(button).toHaveClass("light");
    
    fireEvent.click(button);
    
    expect(button).toHaveClass("dark");
    expect(button).toHaveAttribute("title", "Switch to light mode");
    expect(screen.getByText("🌙")).toBeInTheDocument();
    expect(localStorageMock.setItem).toHaveBeenCalledWith("theme", "dark");
  });

  test("prevents rapid clicking during transition", async () => {
    render(<ThemeToggle />);
    
    const button = screen.getByRole("button");
    
    fireEvent.click(button);
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
    
    fireEvent.click(button);
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
    
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    }, { timeout: 400 });
    
    fireEvent.click(button);
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);
  });

  test("button is disabled during transition", () => {
    render(<ThemeToggle />);
    
    const button = screen.getByRole("button");
    fireEvent.click(button);
    
    expect(button).toBeDisabled();
  });

  test("applies correct CSS custom properties for dark theme", () => {
    localStorageMock.getItem.mockReturnValue("dark");
    render(<ThemeToggle />);
    
    expect(mockSetProperty).toHaveBeenCalledWith("--bg-primary", "#0f0f0f");
    expect(mockSetProperty).toHaveBeenCalledWith("--bg-secondary", "#1a1a1a");
    expect(mockSetProperty).toHaveBeenCalledWith("--primary-text", "#f8fafc");
    expect(mockSetProperty).toHaveBeenCalledWith("--secondary-text", "rgba(255, 255, 255, 0.7)");
    expect(mockSetProperty).toHaveBeenCalledWith("--gradient-primary", "linear-gradient(135deg, #0ea5e9, #06b6d4)");
  });

  test("applies correct CSS custom properties for light theme", () => {
    localStorageMock.getItem.mockReturnValue("dark");
    render(<ThemeToggle />);
    
    mockSetProperty.mockClear();
    
    const button = screen.getByRole("button");
    fireEvent.click(button);
    
    expect(mockSetProperty).toHaveBeenCalledWith("--bg-primary", "#ffffff");
    expect(mockSetProperty).toHaveBeenCalledWith("--bg-secondary", "#f8fafc");
    expect(mockSetProperty).toHaveBeenCalledWith("--primary-text", "#1e293b");
    expect(mockSetProperty).toHaveBeenCalledWith("--secondary-text", "#475569");
    expect(mockSetProperty).toHaveBeenCalledWith("--gradient-primary", "linear-gradient(135deg, #0ea5e9, #06b6d4)");
  });

  test("uses requestAnimationFrame for smooth transitions", () => {
    render(<ThemeToggle />);
    
    expect(global.requestAnimationFrame).toHaveBeenCalled();
  });

  test("has proper accessibility attributes", () => {
    render(<ThemeToggle />);
    
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Toggle theme");
    expect(button).toHaveAttribute("title");
  });

  test("maintains theme state across re-renders", () => {
    localStorageMock.getItem.mockReturnValue("light");
    const { rerender } = render(<ThemeToggle />);
    
    let button = screen.getByRole("button");
    expect(button).toHaveClass("light");
    
    rerender(<ThemeToggle />);
    
    button = screen.getByRole("button");
    expect(button).toHaveClass("light");
  });
});
