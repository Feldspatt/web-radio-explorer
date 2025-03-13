import { ThemeContext, ThemeContextType } from "../contexts/ThemeContext.tsx"
import { useContext } from "react"

/**
 * Hook to use the theme context
 * @returns ThemeContextType object
 */
export const useTheme = (): ThemeContextType => {
	const context = useContext(ThemeContext)
	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider")
	}
	return context
}
