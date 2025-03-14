import {useCallback, useEffect, useState} from "react";
import {themes} from "../services/themes/themes.ts";
import {ThemeContextType} from "../contexts/ThemeContext.tsx";
import {applyTheme} from "../services/themes/applyThemes.ts";

/**
 * Creates a global CSS rule to ensure all elements inherit transitions
 * @param transitionDuration Transition duration in ms
 */
export const setupGlobalThemeTransitions = (transitionDuration: number = 400): void => {
    // Create a style element if it doesn't exist already
    let styleElement = document.getElementById('theme-transition-styles');

    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'theme-transition-styles';
        document.head.appendChild(styleElement);

        // Apply transition inheritance to all elements
        styleElement.textContent = `
      * {
        transition-property: color, background-color, border-color, box-shadow;
        transition-duration: ${transitionDuration}ms;
        transition-timing-function: ease;
      }
      
      /* Exception for elements where transition might cause issues */
      .no-transition,
      .no-transition * {
        transition: none !important;
      }
    `;
    }
};

/**
 * A custom hook that applies the theme and returns functions to change themes
 * @param initialTheme The initial theme to apply
 * @param transitionDuration Optional transition duration in ms
 * @returns ThemeContextType object
 */
export const useThemeApplier = (
    initialTheme: string = 'dark',
    transitionDuration: number = 400
): ThemeContextType => {
    const [currentTheme, setCurrentTheme] = useState<string>(window.localStorage.getItem('theme') ?? initialTheme);

    // Setup global transitions on mount
    useEffect(() => {
        setupGlobalThemeTransitions(transitionDuration);
    }, [transitionDuration]);

    // Apply theme whenever it changes
    useEffect(() => {
        const theme: Theme = themes[currentTheme] || themes.dark;
        window.localStorage.setItem('theme', theme.name);
        applyTheme(theme, document.documentElement, transitionDuration);
    }, [currentTheme, transitionDuration]);

    const setTheme = useCallback((themeName: string) => {
        if (themes[themeName]) {
            setCurrentTheme(themeName);
        } else {
            console.warn(`Theme "${themeName}" not found, using default`);
            setCurrentTheme('dark');
        }
    }, []);

    // Next theme function to cycle to the next theme
    const getNextTheme = useCallback(() => {
        const themeNames = Object.keys(themes);
        const currentIndex = themeNames.indexOf(currentTheme);
        const nextIndex = (currentIndex + 1) % themeNames.length;
        return themeNames[nextIndex]
    }, [currentTheme]);

    const switchToNextTheme =()=>{
        setCurrentTheme(getNextTheme());
    }

    return {
        getNextTheme,
        switchToNextTheme,
        theme: themes[currentTheme] || themes.dark,
        setTheme,
        themes
    };
};