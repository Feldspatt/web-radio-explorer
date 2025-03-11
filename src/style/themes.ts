export interface HSLAColor {
    hue: number;
    saturation: number;
    lightness: number;
    alpha: number;
}

// Define the GradientColor type for backgrounds
export interface GradientColor {
    type: 'linear-gradient';
    angle: number;
    colors: Array<{
        color: string;
        position?: number;
    }>;
}

// Define the SolidColor type
export interface SolidColor {
    type: 'solid';
    color: string;
}

// Union type for different color formats
export type ColorValue = HSLAColor | GradientColor | SolidColor;

// Helper function to parse HSLA string into HSLAColor object
export const parseHSLA = (hsla: string): HSLAColor => {
    const match = hsla.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%,\s*(\d+\.\d+|\d+)\)/);
    if (match) {
        return {
            hue: parseInt(match[1], 10),
            saturation: parseInt(match[2], 10),
            lightness: parseInt(match[3], 10),
            alpha: parseFloat(match[4]),
        };
    }
    // Default fallback
    return { hue: 220, saturation: 100, lightness: 50, alpha: 1 };
};

// Helper function to convert HSLAColor to CSS string
export const hslaToString = (hsla: HSLAColor): string => {
    return `hsla(${hsla.hue}, ${hsla.saturation}%, ${hsla.lightness}%, ${hsla.alpha})`;
};

// Helper function to parse gradient
export const parseGradient = (gradient: string): GradientColor => {
    // Basic parsing for linear gradients
    const match = gradient.match(/linear-gradient\((\d+)deg,\s*(.*)\)/);
    if (match) {
        const angle = parseInt(match[1], 10);
        const colorParts = match[2].split(',').map(part => part.trim());

        const colors = colorParts.map(part => ({
            color: part,
        }));

        return {
            type: 'linear-gradient',
            angle,
            colors
        };
    }

    // Default fallback
    return {
        type: 'linear-gradient',
        angle: 145,
        colors: [
            { color: 'hsl(0, 0%, 7%)' },
            { color: 'hsl(0, 0%, 10%)' }
        ]
    };
};

// Helper to convert a gradient to CSS string
export const gradientToString = (gradient: GradientColor): string => {
    const colorString = gradient.colors
        .map(c => c.color)
        .join(', ');

    return `linear-gradient(${gradient.angle}deg, ${colorString})`;
};

// Main Theme interface
export interface Theme {
    name: string;
    symbol: string,

    // Backgrounds
    colorBgMain: GradientColor | SolidColor;
    colorBgPanel: GradientColor | SolidColor;

    // Visualizer colors
    barHueStart: HSLAColor;
    barHueEnd: HSLAColor;

    // Input backgrounds
    colorBgInput: HSLAColor;
    colorBgInputFocus: HSLAColor;

    // Item backgrounds
    colorBgItem: HSLAColor;
    colorBgItemHover: HSLAColor;

    // Text colors
    colorTextPrimary: string;
    colorTextSecondary: string;
    colorTextTertiary: string;
    colorTextInverse: string;
    colorTextHeaderPrimary: string;

    // Border styles
    borderRadius: number;
    borderColor: string;
    border: string;

    // Effects
    textShadow: string;
    boxShadow: string;

    // Fonts
    fontPrimary: string;
    fontSecondary: string;

    // Button styles
    colorButtonBg: GradientColor | SolidColor;
    colorButtonBgHover: GradientColor | SolidColor;

    // Tag styles
    colorTagBg: HSLAColor;
    colorTagText: string;

    // Play button colors
    colorTextPlayButtonPlay: string;
    colorTextPlayButtonPause: string;
    colorTextPlayButtonRetry: string;
    colorPlayButtonPlay: string;
    colorPlayButtonPause: string;
    colorPlayButtonRetry: string;

    // Status colors
    colorBgOnline: HSLAColor;
    colorBgLoading: string;
    colorBgPause: string;
    colorBgError: HSLAColor;
}

// Dark Theme
export const darkTheme: Theme = {
    name: 'dark',
    symbol: '🌙',

    colorBgMain: {
        type: 'linear-gradient',
        angle: 145,
        colors: [
            { color: 'hsl(0, 0%, 7%)' },
            { color: 'hsl(0, 0%, 10%)' }
        ]
    },
    colorBgPanel: {
        type: 'linear-gradient',
        angle: 145,
        colors: [
            { color: 'hsl(0, 0%, 12%)' },
            { color: 'hsl(0, 0%, 15%)' }
        ]
    },

    barHueStart: { hue: 220, saturation: 100, lightness: 60, alpha: 0.7 },
    barHueEnd: { hue: 280, saturation: 100, lightness: 65, alpha: 0.8 },

    colorBgInput: { hue: 0, saturation: 0, lightness: 100, alpha: 0.1 },
    colorBgInputFocus: { hue: 0, saturation: 0, lightness: 100, alpha: 0.2 },

    colorBgItem: { hue: 0, saturation: 0, lightness: 100, alpha: 0.05 },
    colorBgItemHover: { hue: 0, saturation: 0, lightness: 100, alpha: 0.1 },

    colorTextPrimary: 'hsl(0, 0%, 95%)',
    colorTextSecondary: 'hsl(0, 0%, 74%)',
    colorTextTertiary: 'hsl(0, 0%, 46%)',
    colorTextInverse: 'hsl(0, 0%, 7%)',
    colorTextHeaderPrimary: 'hsl(186, 100%, 38%)',

    borderRadius: 5,
    borderColor: 'var(--color-bg-main)',
    border: '1px solid hsla(0, 0%, 100%, 0.1)',

    textShadow: '0 2px 4px hsla(0, 0%, 0%, 0.5)',
    boxShadow: '2px 2px 5px hsla(0, 0%, 0%, 0.5), -2px -2px 5px hsla(0, 0%, 100%, 0.05)',

    fontPrimary: "'Inter', 'Roboto', sans-serif",
    fontSecondary: "'Montserrat', 'Arial', sans-serif",

    colorButtonBg: {
        type: 'linear-gradient',
        angle: 145,
        colors: [
            { color: 'hsl(186, 100%, 38%)' },
            { color: 'hsl(186, 100%, 30%)' }
        ]
    },
    colorButtonBgHover: {
        type: 'linear-gradient',
        angle: 145,
        colors: [
            { color: 'hsl(186, 77%, 50%)' },
            { color: 'hsl(186, 100%, 38%)' }
        ]
    },

    colorTagBg: { hue: 186, saturation: 77, lightness: 50, alpha: 0.3 },
    colorTagText: 'hsl(0, 0%, 74%)',

    colorTextPlayButtonPlay: 'hsl(210, 100%, 92%)',
    colorTextPlayButtonPause: 'hsl(210, 100%, 92%)',
    colorTextPlayButtonRetry: 'hsl(210, 100%, 92%)',

    colorPlayButtonPlay: 'hsl(147, 70%, 40%)',
    colorPlayButtonPause: 'hsl(39, 85%, 55%)',
    colorPlayButtonRetry: 'hsl(355, 75%, 55%)',

    colorBgOnline: { hue: 122, saturation: 39, lightness: 49, alpha: 0.3 },
    colorBgLoading: 'hsl(186, 100%, 38%)',
    colorBgPause: 'hsl(0, 77%, 65%)',
    colorBgError: { hue: 350, saturation: 100, lightness: 69, alpha: 0.3 }
};

// Nordic Theme
export const nordicTheme: Theme = {
    name: 'nordic',
    symbol: '❄',

    colorBgMain: {
        type: 'linear-gradient',
        angle: 145,
        colors: [
            { color: 'hsl(210, 25%, 15%)' },
            { color: 'hsl(210, 25%, 18%)' }
        ]
    },
    colorBgPanel: {
        type: 'linear-gradient',
        angle: 145,
        colors: [
            { color: 'hsl(210, 25%, 20%)' },
            { color: 'hsl(210, 25%, 25%)' }
        ]
    },

    barHueStart: { hue: 190, saturation: 80, lightness: 45, alpha: 0.6 },
    barHueEnd: { hue: 230, saturation: 75, lightness: 50, alpha: 0.7 },

    colorBgInput: { hue: 0, saturation: 0, lightness: 100, alpha: 0.1 },
    colorBgInputFocus: { hue: 0, saturation: 0, lightness: 100, alpha: 0.2 },

    colorBgItem: { hue: 0, saturation: 0, lightness: 100, alpha: 0.05 },
    colorBgItemHover: { hue: 0, saturation: 0, lightness: 100, alpha: 0.1 },

    colorTextPrimary: 'hsl(210, 20%, 85%)',
    colorTextSecondary: 'hsl(210, 20%, 65%)',
    colorTextTertiary: 'hsl(210, 15%, 50%)',
    colorTextInverse: 'hsl(210, 25%, 10%)',
    colorTextHeaderPrimary: 'hsl(180, 50%, 55%)',

    borderRadius: 6,
    borderColor: 'var(--color-bg-main)',
    border: '1px solid hsla(0, 0%, 100%, 0.1)',

    textShadow: '0 2px 4px hsla(0, 0%, 0%, 0.5)',
    boxShadow: '2px 2px 5px hsla(0, 0%, 0%, 0.3), -2px -2px 5px hsla(0, 0%, 100%, 0.05)',

    fontPrimary: "'Rubik', 'Segoe UI', sans-serif",
    fontSecondary: "'Quicksand', 'Arial', sans-serif",

    colorButtonBg: {
        type: 'linear-gradient',
        angle: 145,
        colors: [
            { color: 'hsl(180, 50%, 40%)' },
            { color: 'hsl(180, 50%, 35%)' }
        ]
    },
    colorButtonBgHover: {
        type: 'linear-gradient',
        angle: 145,
        colors: [
            { color: 'hsl(180, 50%, 50%)' },
            { color: 'hsl(180, 50%, 40%)' }
        ]
    },

    colorTagBg: { hue: 180, saturation: 50, lightness: 50, alpha: 0.3 },
    colorTagText: 'hsl(210, 20%, 65%)',

    colorTextPlayButtonPlay: 'hsl(219, 28%, 88%)',
    colorTextPlayButtonPause: 'hsl(219, 28%, 88%)',
    colorTextPlayButtonRetry: 'hsl(219, 28%, 88%)',

    colorPlayButtonPlay: 'hsl(193, 43%, 67%)',
    colorPlayButtonPause: 'hsl(213, 32%, 52%)',
    colorPlayButtonRetry: 'hsl(354, 42%, 56%)',

    colorBgOnline: { hue: 140, saturation: 45, lightness: 50, alpha: 0.3 },
    colorBgLoading: 'hsl(180, 50%, 40%)',
    colorBgPause: 'hsl(0, 60%, 60%)',
    colorBgError: { hue: 350, saturation: 80, lightness: 60, alpha: 0.3 }
};

// Solarized Theme
export const solarizedTheme: Theme = {
    name: 'solarized',
    symbol: '🌞',

    colorBgMain: {
        type: 'linear-gradient',
        angle: 145,
        colors: [
            { color: 'hsl(44, 50%, 90%)' },
            { color: 'hsl(44, 50%, 85%)' }
        ]
    },
    colorBgPanel: {
        type: 'linear-gradient',
        angle: 145,
        colors: [
            { color: 'hsl(44, 50%, 80%)' },
            { color: 'hsl(44, 50%, 75%)' }
        ]
    },

    barHueStart: { hue: 240, saturation: 40, lightness: 50, alpha: 1 },
    barHueEnd: { hue: 180, saturation: 40, lightness: 50, alpha: 1 },

    colorBgInput: { hue: 220, saturation: 15, lightness: 20, alpha: 0.1 },
    colorBgInputFocus: { hue: 220, saturation: 15, lightness: 20, alpha: 0.2 },

    colorBgItem: { hue: 220, saturation: 15, lightness: 20, alpha: 0.05 },
    colorBgItemHover: { hue: 220, saturation: 15, lightness: 20, alpha: 0.1 },

    colorTextPrimary: 'hsl(220, 15%, 20%)',
    colorTextSecondary: 'hsl(220, 10%, 40%)',
    colorTextTertiary: 'hsl(220, 10%, 60%)',
    colorTextInverse: 'hsl(44, 50%, 90%)',
    colorTextHeaderPrimary: 'hsl(187, 100%, 38%)',

    borderRadius: 6,
    borderColor: 'var(--color-bg-main)',
    border: '1px solid hsla(220, 15%, 20%, 0.1)',

    textShadow: '0 1px 2px hsla(220, 15%, 20%, 0.2)',
    boxShadow: '2px 2px 5px hsla(220, 15%, 20%, 0.1), -2px -2px 5px hsla(44, 50%, 95%, 0.2)',

    fontPrimary: "'Source Sans Pro', 'Helvetica', sans-serif",
    fontSecondary: "'Bitter', 'Georgia', serif",

    colorButtonBg: {
        type: 'linear-gradient',
        angle: 145,
        colors: [
            { color: 'hsl(187, 100%, 38%)' },
            { color: 'hsl(187, 100%, 33%)' }
        ]
    },
    colorButtonBgHover: {
        type: 'linear-gradient',
        angle: 145,
        colors: [
            { color: 'hsl(187, 100%, 45%)' },
            { color: 'hsl(187, 100%, 38%)' }
        ]
    },

    colorTagBg: { hue: 187, saturation: 100, lightness: 40, alpha: 0.2 },
    colorTagText: 'hsl(220, 15%, 30%)',

    colorTextPlayButtonPlay: 'hsl(194, 14%, 40%)',
    colorTextPlayButtonPause: 'hsl(194, 14%, 40%)',
    colorTextPlayButtonRetry: 'hsl(194, 14%, 40%)',

    colorPlayButtonPlay: 'hsl(175, 74%, 37%)',
    colorPlayButtonPause: 'hsl(45, 100%, 35%)',
    colorPlayButtonRetry: 'hsl(1, 71%, 52%)',

    colorBgOnline: { hue: 120, saturation: 39, lightness: 49, alpha: 0.3 },
    colorBgLoading: 'hsl(187, 100%, 38%)',
    colorBgPause: 'hsl(0, 77%, 55%)',
    colorBgError: { hue: 350, saturation: 90, lightness: 60, alpha: 0.3 }
};

// Light Theme
export const lightTheme: Theme = {
    name: 'light',
    symbol: '☀️',

    colorBgMain: {
        type: 'linear-gradient',
        angle: 145,
        colors: [
            { color: 'hsl(0, 0%, 77%)' },
            { color: 'hsl(0, 0%, 89%)' }
        ]
    },
    colorBgPanel: {
        type: 'linear-gradient',
        angle: 145,
        colors: [
            { color: 'hsl(0, 0%, 94%)' },
            { color: 'hsl(0, 0%, 92%)' }
        ]
    },

    barHueStart: { hue: 180, saturation: 60, lightness: 40, alpha: 0.7 },
    barHueEnd: { hue: 40, saturation: 70, lightness: 45, alpha: 0.8 },

    colorBgInput: { hue: 0, saturation: 0, lightness: 0, alpha: 0.05 },
    colorBgInputFocus: { hue: 0, saturation: 0, lightness: 0, alpha: 0.1 },

    colorBgItem: { hue: 0, saturation: 0, lightness: 0, alpha: 0.03 },
    colorBgItemHover: { hue: 0, saturation: 0, lightness: 0, alpha: 0.06 },

    colorTextPrimary: 'hsl(0, 0%, 10%)',
    colorTextSecondary: 'hsl(0, 0%, 25%)',
    colorTextTertiary: 'hsl(0, 0%, 40%)',
    colorTextInverse: 'hsl(0, 0%, 98%)',
    colorTextHeaderPrimary: 'hsl(210, 70%, 45%)',

    borderRadius: 6,
    borderColor: 'hsla(0, 0%, 80%, 0.3)',
    border: '1px solid hsla(0, 0%, 0%, 0.08)',

    textShadow: 'none',
    boxShadow: '0 2px 5px hsla(0, 0%, 0%, 0.1)',

    fontPrimary: "'Open Sans', 'Helvetica', sans-serif",
    fontSecondary: "'Poppins', 'Arial', sans-serif",

    colorButtonBg: {
        type: 'linear-gradient',
        angle: 145,
        colors: [
            { color: 'hsl(210, 70%, 50%)' },
            { color: 'hsl(210, 70%, 45%)' }
        ]
    },
    colorButtonBgHover: {
        type: 'linear-gradient',
        angle: 145,
        colors: [
            { color: 'hsl(210, 70%, 55%)' },
            { color: 'hsl(210, 70%, 50%)' }
        ]
    },

    colorTagBg: { hue: 210, saturation: 70, lightness: 50, alpha: 0.2 },
    colorTagText: 'hsl(0, 0%, 25%)',

    colorTextPlayButtonPlay: 'hsl(0, 0%, 20%)',
    colorTextPlayButtonPause: 'hsl(0, 0%, 20%)',
    colorTextPlayButtonRetry: 'hsl(0, 0%, 20%)',

    colorPlayButtonPlay: 'hsl(142, 76%, 45%)',
    colorPlayButtonPause: 'hsl(43, 96%, 58%)',
    colorPlayButtonRetry: 'hsl(3, 90%, 62%)',

    colorBgOnline: { hue: 140, saturation: 70, lightness: 50, alpha: 0.25 },
    colorBgLoading: 'hsl(210, 70%, 50%)',
    colorBgPause: 'hsl(0, 70%, 60%)',
    colorBgError: { hue: 350, saturation: 70, lightness: 60, alpha: 0.25 }
};

// High Contrast Theme
export const highContrastTheme: Theme = {
    name: 'high-contrast',
    symbol: '👁️',

    colorBgMain: {
        type: 'solid',
        color: 'hsl(0, 0%, 0%)'
    },
    colorBgPanel: {
        type: 'solid',
        color: 'hsl(0, 0%, 10%)'
    },

    barHueStart: { hue: 0, saturation: 100, lightness: 50, alpha: 0.9 },
    barHueEnd: { hue: 60, saturation: 100, lightness: 50, alpha: 1 },

    colorBgInput: { hue: 0, saturation: 0, lightness: 100, alpha: 0.2 },
    colorBgInputFocus: { hue: 0, saturation: 0, lightness: 100, alpha: 0.4 },

    colorBgItem: { hue: 0, saturation: 0, lightness: 100, alpha: 0.1 },
    colorBgItemHover: { hue: 0, saturation: 0, lightness: 100, alpha: 0.2 },

    colorTextPrimary: 'hsl(0, 0%, 100%)',
    colorTextSecondary: 'hsl(0, 0%, 80%)',
    colorTextTertiary: 'hsl(0, 0%, 60%)',
    colorTextInverse: 'hsl(0, 0%, 0%)',
    colorTextHeaderPrimary: 'hsl(60, 100%, 50%)',

    borderRadius: 4,
    borderColor: 'hsl(0, 0%, 50%)',
    border: '2px solid hsl(0, 0%, 80%)',

    textShadow: 'none',
    boxShadow: '0 0 5px hsla(0, 0%, 100%, 0.5)',

    fontPrimary: "'Atkinson Hyperlegible', 'Arial', sans-serif",
    fontSecondary: "'Raleway', 'Tahoma', sans-serif",

    colorButtonBg: {
        type: 'linear-gradient',
        angle: 145,
        colors: [
            { color: 'hsl(60, 100%, 50%)' },
            { color: 'hsl(60, 100%, 40%)' }
        ]
    },
    colorButtonBgHover: {
        type: 'linear-gradient',
        angle: 145,
        colors: [
            { color: 'hsl(60, 100%, 60%)' },
            { color: 'hsl(60, 100%, 50%)' }
        ]
    },

    colorTagBg: { hue: 60, saturation: 100, lightness: 50, alpha: 0.4 },
    colorTagText: 'hsl(0, 0%, 0%)',

    colorTextPlayButtonPlay: 'hsl(0, 0%, 100%)',
    colorTextPlayButtonPause: 'hsl(0, 0%, 100%)',
    colorTextPlayButtonRetry: 'hsl(0, 0%, 100%)',

    colorPlayButtonPlay: 'hsl(120, 100%, 50%)',
    colorPlayButtonPause: 'hsl(60, 100%, 50%)',
    colorPlayButtonRetry: 'hsl(0, 100%, 50%)',

    colorBgOnline: { hue: 120, saturation: 100, lightness: 40, alpha: 0.6 },
    colorBgLoading: 'hsl(60, 100%, 50%)',
    colorBgPause: 'hsl(0, 80%, 49%)',
    colorBgError: { hue: 0, saturation: 100, lightness: 50, alpha: 1 }
};

// Create a themes collection for easy access
export const themes = {
    dark: darkTheme,
    nordic: nordicTheme,
    solarized: solarizedTheme,
    light: lightTheme,
    'high-contrast': highContrastTheme
};