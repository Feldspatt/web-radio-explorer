import { ThemeContext } from "../../contexts/ThemeContext.tsx";
import {useThemeApplier} from "../../hooks/useThemeApplier.ts";

/**
 * Creates a Theme Provider component to wrap your application
 */
export const ThemeProvider: React.FC<{
    children: React.ReactNode;
    initialTheme?: string;
}> = ({ children, initialTheme = 'dark' }) => {
    const themeContext = useThemeApplier(initialTheme);

    return (
        <ThemeContext.Provider value={themeContext}>
            {children}
        </ThemeContext.Provider>
    );
};