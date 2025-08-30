import { useState, useEffect, useCallback, useMemo } from "react";
import "./ThemeToggle.css";

interface ThemeColors {
  "--bg-primary": string;
  "--bg-secondary": string;
  "--card-bg": string;
  "--secondary-bg": string;
  "--accent-bg": string;
  "--surface-bg": string;
  "--text-primary": string;
  "--primary-text": string;
  "--secondary-text": string;
  "--border-color": string;
  "--accent-color": string;
  "--accent-hover": string;
  "--success-color": string;
  "--error-color": string;
  "--warning-color": string;
  "--gradient-primary": string;
  "--gradient-hover": string;
  "--shadow-sm": string;
  "--shadow-md": string;
  "--shadow-lg": string;
  "--shadow-xl": string;
}

export default function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const themeConfigs = useMemo<{ dark: ThemeColors; light: ThemeColors }>(() => ({
    dark: {
      "--bg-primary": "#0f0f0f",
      "--bg-secondary": "#1a1a1a",
      "--card-bg": "rgba(255, 255, 255, 0.02)",
      "--secondary-bg": "#1e293b",
      "--accent-bg": "#334155",
      "--surface-bg": "#475569",
      "--text-primary": "#ffffff",
      "--primary-text": "#f8fafc",
      "--secondary-text": "rgba(255, 255, 255, 0.7)",
      "--border-color": "rgba(255, 255, 255, 0.1)",
      "--accent-color": "#0ea5e9",
      "--accent-hover": "#0284c7",
      "--success-color": "#10b981",
      "--error-color": "#ef4444",
      "--warning-color": "#f59e0b",
      "--gradient-primary": "linear-gradient(135deg, #0ea5e9, #06b6d4)",
      "--gradient-hover": "linear-gradient(135deg, #0284c7, #0891b2)",
      "--shadow-sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      "--shadow-md": "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      "--shadow-lg": "0 10px 15px -3px rgb(0 0 0 / 0.1)",
      "--shadow-xl": "0 20px 25px -5px rgb(0 0 0 / 0.1)"
    },
    light: {
      "--bg-primary": "#ffffff",
      "--bg-secondary": "#f8fafc",
      "--card-bg": "rgba(255, 255, 255, 0.95)",
      "--secondary-bg": "#f1f5f9",
      "--accent-bg": "#e2e8f0",
      "--surface-bg": "#cbd5e1",
      "--text-primary": "#0f172a",
      "--primary-text": "#1e293b",
      "--secondary-text": "#475569",
      "--border-color": "rgba(15, 23, 42, 0.08)",
      "--accent-color": "#0ea5e9",
      "--accent-hover": "#0284c7",
      "--success-color": "#059669",
      "--error-color": "#dc2626",
      "--warning-color": "#d97706",
      "--gradient-primary": "linear-gradient(135deg, #0ea5e9, #06b6d4)",
      "--gradient-hover": "linear-gradient(135deg, #0284c7, #0891b2)",
      "--shadow-sm": "0 1px 2px 0 rgb(15 23 42 / 0.03)",
      "--shadow-md": "0 4px 6px -1px rgb(15 23 42 / 0.06)",
      "--shadow-lg": "0 10px 15px -3px rgb(15 23 42 / 0.08)",
      "--shadow-xl": "0 20px 25px -5px rgb(15 23 42 / 0.1)"
    }
  }), []);

  const applyTheme = useCallback((isDark: boolean) => {
    const root = document.documentElement;
    const config = isDark ? themeConfigs.dark : themeConfigs.light;
    
    requestAnimationFrame(() => {
      Object.entries(config).forEach(([property, value]) => {
        root.style.setProperty(property, value);
      });
      
      document.body.setAttribute("data-theme", isDark ? "dark" : "light");
    });
  }, [themeConfigs]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      const isDark = savedTheme === "dark";
      setIsDarkMode(isDark);
      applyTheme(isDark);
    } else {
      applyTheme(true);
    }
  }, [applyTheme]);

  const toggleTheme = useCallback(() => {
    if (isTransitioning) return;
    
    const newIsDarkMode = !isDarkMode;
    
    setIsDarkMode(newIsDarkMode);
    setIsTransitioning(true);
    applyTheme(newIsDarkMode);
    localStorage.setItem("theme", newIsDarkMode ? "dark" : "light");
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  }, [isDarkMode, isTransitioning, applyTheme]);

  return (
    <button
      className={`theme-toggle ${isDarkMode ? 'dark' : 'light'}`}
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      disabled={isTransitioning}
    >
      <div className="theme-toggle-track">
        <div className="theme-toggle-thumb">
          <span className="theme-icon">
            {isDarkMode ? '🌙' : '☀️'}
          </span>
        </div>
      </div>
    </button>
  );
}
