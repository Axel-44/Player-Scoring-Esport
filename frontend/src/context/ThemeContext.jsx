/**
 * frontend/src/context/ThemeContext.jsx
 * Theme Provider untuk Dark & Light Mode dengan animasi "Circular Reveal" View Transitions API:
 * - Menggunakan class 'dark' / 'light' pada root document.
 * - Mengeliminasi FOUC (flash of unstyled content) bersama script bootstrap di index.html.
 * - Transisi Circular Reveal halus membesar dari koordinat tombol toggle ke seluruh layar.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem("pulse_scout_theme");
      if (saved === "light" || saved === "dark") return saved;
      return "dark"; // Default Dark Mode
    } catch {
      return "dark";
    }
  });

  // Sinkronkan class root dan localStorage saat theme berubah
  const applyThemeToDOM = useCallback((newTheme) => {
    const root = document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem("pulse_scout_theme", newTheme);
    } catch {}
  }, []);

  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme, applyThemeToDOM]);

  // Fungsi toggle theme dengan animasi Circular Reveal View Transitions
  const toggleTheme = (event) => {
    const isDark = theme === "dark";
    const nextTheme = isDark ? "light" : "dark";

    // Fallback jika browser tidak mendukung View Transitions API
    if (!document.startViewTransition) {
      setTheme(nextTheme);
      applyThemeToDOM(nextTheme);
      return;
    }

    // Koordinat klik tombol (atau pusat layar jika dipicu keyboard)
    const x = event?.clientX ?? window.innerWidth / 2;
    const y = event?.clientY ?? window.innerHeight / 2;

    // Radius terjauh untuk menutupi seluruh layar secara penuh
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      setTheme(nextTheme);
      applyThemeToDOM(nextTheme);
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 500,
          easing: "cubic-bezier(0.2, 0, 0, 1)",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === "dark",
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
