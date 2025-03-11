import {useCallback, useEffect, useState} from "react";
import {GradientColor, gradientToString, hslaToString, Theme, themes} from "../style/themes.ts";
import {ThemeContextType} from "../contexts/ThemeContext.tsx";

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
 * Applies the provided theme to the application with smooth transitions
 * @param theme The theme to apply
 * @param targetElement Optional target element (defaults to document.documentElement)
 * @param transitionDuration Optional transition duration in ms (defaults to 400ms)
 */
export const applyTheme = (
    theme: Theme,
    targetElement: HTMLElement = document.documentElement,
    transitionDuration: number = 400
): void => {
    // Setup transition properties if not already set
    const currentTransition = targetElement.style.getPropertyValue('transition');

    if (!currentTransition.includes('--color')) {
        // Apply transitions to all CSS variables for smooth theme changes
        const transitionValue = `
      background-color ${transitionDuration}ms ease,
      color ${transitionDuration}ms ease,
      border-color ${transitionDuration}ms ease,
      box-shadow ${transitionDuration}ms ease,
      --color-bg-main ${transitionDuration}ms ease,
      --color-bg-panel ${transitionDuration}ms ease,
      --bar-hue-start ${transitionDuration}ms ease,
      --bar-hue-end ${transitionDuration}ms ease,
      --color-bg-input ${transitionDuration}ms ease,
      --color-bg-input-focus ${transitionDuration}ms ease,
      --color-bg-item ${transitionDuration}ms ease,
      --color-bg-item-hover ${transitionDuration}ms ease,
      --color-text-primary ${transitionDuration}ms ease,
      --color-text-secondary ${transitionDuration}ms ease,
      --color-text-tertiary ${transitionDuration}ms ease,
      --color-text-inverse ${transitionDuration}ms ease,
      --color-text-header-primary ${transitionDuration}ms ease,
      --border-color ${transitionDuration}ms ease,
      --color-button-bg ${transitionDuration}ms ease,
      --color-button-bg-hover ${transitionDuration}ms ease,
      --color-tag-bg ${transitionDuration}ms ease,
      --color-tag-text ${transitionDuration}ms ease,
      --color-play-button-play ${transitionDuration}ms ease,
      --color-play-button-pause ${transitionDuration}ms ease,
      --color-play-button-retry ${transitionDuration}ms ease,
      --color-bg-online ${transitionDuration}ms ease,
      --color-bg-loading ${transitionDuration}ms ease,
      --color-bg-pause ${transitionDuration}ms ease,
      --color-bg-error ${transitionDuration}ms ease
    `;

        targetElement.style.setProperty('transition', transitionValue);
    }

    // Define CSS variables from theme properties
    const cssVars: Record<string, string> = {
        // Backgrounds
        '--color-bg-main': theme.colorBgMain.type === 'solid'
            ? theme.colorBgMain.color
            : gradientToString(theme.colorBgMain as GradientColor),
        '--color-bg-panel': theme.colorBgPanel.type === 'solid'
            ? theme.colorBgPanel.color
            : gradientToString(theme.colorBgPanel as GradientColor),

        // Visualizer colors
        '--bar-hue-start': hslaToString(theme.barHueStart),
        '--bar-hue-end': hslaToString(theme.barHueEnd),

        // Input backgrounds
        '--color-bg-input': hslaToString(theme.colorBgInput),
        '--color-bg-input-focus': hslaToString(theme.colorBgInputFocus),

        // Item backgrounds
        '--color-bg-item': hslaToString(theme.colorBgItem),
        '--color-bg-item-hover': hslaToString(theme.colorBgItemHover),

        // Text colors
        '--color-text-primary': theme.colorTextPrimary,
        '--color-text-secondary': theme.colorTextSecondary,
        '--color-text-tertiary': theme.colorTextTertiary,
        '--color-text-inverse': theme.colorTextInverse,
        '--color-text-header-primary': theme.colorTextHeaderPrimary,

        // Border styles
        '--border-radius': `${theme.borderRadius}px`,
        '--border-color': theme.borderColor,
        '--border': theme.border,

        // Effects
        '--text-shadow': theme.textShadow,
        '--box-shadow': theme.boxShadow,

        // Fonts
        '--font-primary': theme.fontPrimary,
        '--font-secondary': theme.fontSecondary,

        // Button styles
        '--color-button-bg': theme.colorButtonBg.type === 'solid'
            ? theme.colorButtonBg.color
            : gradientToString(theme.colorButtonBg as GradientColor),
        '--color-button-bg-hover': theme.colorButtonBgHover.type === 'solid'
            ? theme.colorButtonBgHover.color
            : gradientToString(theme.colorButtonBgHover as GradientColor),

        // Tag styles
        '--color-tag-bg': hslaToString(theme.colorTagBg),
        '--color-tag-text': theme.colorTagText,

        // Play button colors
        '--color-text-play-button-play': theme.colorTextPlayButtonPlay,
        '--color-text-play-button-pause': theme.colorTextPlayButtonPause,
        '--color-text-play-button-retry': theme.colorTextPlayButtonRetry,
        '--color-play-button-play': theme.colorPlayButtonPlay,
        '--color-play-button-pause': theme.colorPlayButtonPause,
        '--color-play-button-retry': theme.colorPlayButtonRetry,

        // Status colors
        '--color-bg-online': hslaToString(theme.colorBgOnline),
        '--color-bg-loading': theme.colorBgLoading,
        '--color-bg-pause': theme.colorBgPause,
        '--color-bg-error': hslaToString(theme.colorBgError),

        // Theme name (for potential debugging/reference)
        '--theme-name': theme.name
    };

    // Apply CSS variables to the target element
    Object.entries(cssVars).forEach(([property, value]) => {
        targetElement.style.setProperty(property, value);
    });

    // Optionally add a data attribute to indicate the current theme
    targetElement.dataset.theme = theme.name;
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
    const [currentTheme, setCurrentTheme] = useState<string>(initialTheme);

    // Setup global transitions on mount
    useEffect(() => {
        setupGlobalThemeTransitions(transitionDuration);
    }, [transitionDuration]);

    // Apply theme whenever it changes
    useEffect(() => {
        // @ts-ignore
        const theme = themes[currentTheme] || themes.dark;
        applyTheme(theme, document.documentElement, transitionDuration);
    }, [currentTheme, transitionDuration]);

    const setTheme = useCallback((themeName: string) => {
        // @ts-ignore
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
        // @ts-ignore
        theme: themes[currentTheme] || themes.dark,
        setTheme,
        themes
    };
};