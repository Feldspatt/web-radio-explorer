import { ThemeContext } from "../contexts/ThemeContext.tsx"
import { useThemeApplier } from "../hooks/useThemeApplier.ts"

/**
 * Creates a Theme Provider component to wrap your application
 */
export const ThemeProvider: React.FC<{
	children: React.ReactNode
	initialTheme?: string
	transitionDuration?: number
}> = ({ children, initialTheme = "dark", transitionDuration = 400 }) => {
	const themeContext = useThemeApplier(initialTheme, transitionDuration)

	return <ThemeContext.Provider value={themeContext}>{children}</ThemeContext.Provider>
}
