

// Create context with default values
import {createContext} from "react";
import {themes} from "../services/theme.service.ts";

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    availableThemes: Theme[];
}

export const ThemeContext = createContext<ThemeContextType>({
    theme: themes[0],
    setTheme: () => {},
    toggleTheme: () => {},
    availableThemes: themes
});