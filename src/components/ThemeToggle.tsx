import { useTheme } from "../hooks/useTheme.ts"

const ThemeToggle = () => {
	const { theme, switchToNextTheme, getNextTheme } = useTheme()

	return (
		<button
			className='theme-toggle'
			onClick={switchToNextTheme}
			aria-label={`Switch to ${getNextTheme()} mode`}
			title={`Switch to ${getNextTheme()} mode`}
		>
			{theme.symbol}
		</button>
	)
}

export default ThemeToggle
