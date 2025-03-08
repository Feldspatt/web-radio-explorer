// src/contexts/ThemeContext.tsx
import { createContext, useState, useEffect, ReactNode } from 'react';

// Define available themes
export type ThemeName = 'light-theme' | 'dark-theme' | 'blue-theme' | 'green-theme' | 'high-contrast-theme';

// Define the contexts shape
interface ThemeContextType {
    theme: ThemeName;
    setTheme: (theme: ThemeName) => void;
    toggleTheme: () => void;
    availableThemes: ThemeName[];
}

// Create contexts with default values
export const ThemeContext = createContext<ThemeContextType>({
    theme: 'light-theme',
    setTheme: () => {},
    toggleTheme: () => {},
    availableThemes: ['light-theme', 'dark-theme']
});

interface ThemeProviderProps {
    children: ReactNode;
    defaultTheme?: ThemeName;
    availableThemes?: ThemeName[];
}

export const ThemeProvider = ({
                                  children,
                                  defaultTheme = 'light-theme',
                                  availableThemes = ['light-theme', 'dark-theme', 'blue-theme', 'green-theme', 'high-contrast-theme']
                              }: ThemeProviderProps) => {
    const [theme, setThemeState] = useState<ThemeName>(() => {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme') as ThemeName | null;

        if (savedTheme && availableThemes.includes(savedTheme)) {
            return savedTheme;
        }

        // Use system preference as fallback if no saved theme
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return availableThemes.includes('dark-theme') ? 'dark-theme' : defaultTheme;
        }

        return defaultTheme;
    });

    // Set theme in document and localStorage
    useEffect(() => {
        // Remove all theme classes first
        availableThemes.forEach(themeName => {
            document.documentElement.classList.remove(themeName);
        });

        // Add current theme class
        document.documentElement.classList.add(theme);

        // Save theme preference
        localStorage.setItem('theme', theme);
    }, [theme, availableThemes]);

    // Listen for system theme changes (only if using system preference)
    useEffect(() => {
        const isUsingSystemPreference = !localStorage.getItem('theme');
        if (!isUsingSystemPreference) return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e: MediaQueryListEvent) => {
            const newTheme = e.matches ? 'dark-theme' : 'light-theme';
            if (availableThemes.includes(newTheme)) {
                setThemeState(newTheme);
            }
        };

        // Add event listener
        mediaQuery.addEventListener('change', handleChange);

        // Cleanup
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [availableThemes]);

    // Custom setter that validates the theme
    const setTheme = (newTheme: ThemeName) => {
        if (availableThemes.includes(newTheme)) {
            setThemeState(newTheme);
        } else {
            console.warn(`Theme "${newTheme}" is not available. Using default theme instead.`);
            setThemeState(defaultTheme);
        }
    };

    // Toggle through available themes in sequence
    const toggleTheme = () => {
        setThemeState(prevTheme => {
            const currentIndex = availableThemes.indexOf(prevTheme);
            const nextIndex = (currentIndex + 1) % availableThemes.length;
            return availableThemes[nextIndex];
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, availableThemes }}>
            {children}
        </ThemeContext.Provider>
    );
};