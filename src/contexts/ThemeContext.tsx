import { createContext } from "react"

// Updated Theme context type with nextTheme function
export interface ThemeContextType {
	theme: Theme
	setTheme: (themeName: string) => void
	switchToNextTheme: () => void
	themes: Record<string, Theme>
	getNextTheme: () => string
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined)
