import { useState, useEffect, ReactNode } from 'react';
import {themes} from "../../services/theme.service.ts";
import { ThemeContext } from '../../contexts/ThemeContext.tsx';

interface ThemeProviderProps {
    children: ReactNode;
    defaultTheme?: Theme;
    availableThemes?: Theme[];
}

export const ThemeProvider = ({
                                  children,
                              }: ThemeProviderProps) => {
    const [theme, setThemeState] = useState<Theme>(() => {
        // Check for saved theme preference
        const savedThemeName = localStorage.getItem('theme');

        if (savedThemeName) {
            // Find the theme object that matches the saved name
            const savedTheme = themes.find(t => t.name === savedThemeName);
            if (savedTheme) {
                return savedTheme;
            }
        }

        return themes[0];
    });

    // Set theme in document and localStorage
    useEffect(() => {
        // Remove all theme classes first
        for (const t of themes) {
            document.documentElement.classList.remove(t.name);
        }

        // Add the active theme class
        document.documentElement.classList.add(theme.name);

        // Store just the theme name in localStorage
        localStorage.setItem('theme', theme.name);
    }, [theme]);

    // Listen for system theme changes (only if using system preference)
    useEffect(() => {
        const isUsingSystemPreference = !localStorage.getItem('theme');
        if (!isUsingSystemPreference) return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e: MediaQueryListEvent) => {
            const newThemeName = e.matches ? 'dark-theme' : 'light-theme';
            const newTheme = themes.find(theme => theme.name === newThemeName);
            if (newTheme) setThemeState(newTheme);
        };

        // Add event listener
        mediaQuery.addEventListener('change', handleChange);

        // Cleanup
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Custom setter that validates the theme
    const setTheme = (newTheme: Theme) => {
        const validTheme = themes.find(t => t.name === newTheme.name);
        if (validTheme) {
            setThemeState(validTheme);
        } else {
            console.warn(`Theme "${newTheme.name}" is not available. Using default theme instead.`);
            setThemeState(themes[0]);
        }
    };

    // Toggle through available themes in sequence
    const toggleTheme = () => {
        setThemeState(prevTheme => {
            const currentIndex = themes.findIndex(t => t.name === prevTheme.name);
            const nextIndex = (currentIndex + 1) % themes.length;
            return themes[nextIndex];
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, availableThemes: themes }}>
            {children}
        </ThemeContext.Provider>
    );
};