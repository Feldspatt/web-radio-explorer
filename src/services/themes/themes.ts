import {darkTheme} from "../../style/dark.theme.ts";
import {solarizedTheme} from "../../style/solarized.theme.ts";
import {lightTheme} from "../../style/light.theme.ts";
import {nordicTheme} from "../../style/nordic.theme.ts";
import {highContrastTheme} from "../../style/highContrast.theme.ts";

// Create a themes collection for easy access
export const themes: Record<string, Theme> = {
    nordic: nordicTheme,
    dark: darkTheme,
    solarized: solarizedTheme,
    light: lightTheme,
    'high-contrast': highContrastTheme
};