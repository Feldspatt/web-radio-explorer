// src/contexts/ThemeContext.tsx
import { createContext, useState, useEffect, ReactNode } from 'react';

// Define the contexts shape
interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    availableThemes: Theme[];
}


const themes: Theme[] = [
    {
        name: 'light-theme',
        symbol: '☀️',
        label: 'Light'
    },
    {
        name: 'dark-theme',
        symbol: '🌙',
        label: 'Dark'
    },
    {
        name: 'solarized-theme',
        symbol: '🌞',
        label: 'Solarized'
    },
    {
        name: 'blue-theme',
        symbol: '🌊',
        label: 'Blue'
    },
    {
        name: 'green-theme',
        symbol: '🌿',
        label: 'Green'
    },
    {
        name: 'high-contrast-theme',
        symbol: '👁️',
        label: 'High Contrast'
    },
    {
        name: 'sepia-theme',
        symbol: '📜',
        label: 'Sepia'
    },
    {
        name: 'nord-theme',
        symbol: '❄️',
        label: 'Nord'
    },
    {
        name: 'cyberpunk-theme',
        symbol: '⚡',
        label: 'Cyberpunk'
    },
    {
        name: 'pastel-theme',
        symbol: '🎨',
        label: 'Pastel'
    }
];

// Create contexts with default values
export const ThemeContext = createContext<ThemeContextType>({
    theme: themes[0],
    setTheme: () => {},
    toggleTheme: () => {},
    availableThemes: themes
});

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
        const savedTheme = localStorage.getItem('theme') as Theme | null;

        if (savedTheme && themes.includes(savedTheme)) {
            return savedTheme;
        }

        // Use system preference as fallback if no saved theme
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return themes.find(theme => theme.name === 'dark-theme') ?? themes[0];
        }

        return themes[0];
    });

    // Set theme in document and localStorage
    useEffect(() => {

        for(const theme of themes){
            document.documentElement.classList.remove(theme.name);
        }

        document.documentElement.classList.add(theme.name);
        localStorage.setItem('theme', theme.name);
    }, [theme, themes]);

    // Listen for system theme changes (only if using system preference)
    useEffect(() => {
        const isUsingSystemPreference = !localStorage.getItem('theme');
        if (!isUsingSystemPreference) return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e: MediaQueryListEvent) => {
            const newThemeName = e.matches ? 'dark-theme' : 'light-theme';
            const newTheme = themes.find(theme=> theme.name === newThemeName)
            if(newTheme) setThemeState(newTheme);
        }

        // Add event listener
        mediaQuery.addEventListener('change', handleChange);

        // Cleanup
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [themes]);

    // Custom setter that validates the theme
    const setTheme = (newTheme: Theme) => {
        if (themes.includes(newTheme)) {
            setThemeState(newTheme);
        } else {
            console.warn(`Theme "${newTheme}" is not available. Using default theme instead.`);
            setThemeState(themes[0]);
        }
    };

    // Toggle through available themes in sequence
    const toggleTheme = () => {
        setThemeState(prevTheme => {
            const currentIndex = themes.indexOf(prevTheme);
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