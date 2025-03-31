import "../style/ThemeToggle.css";
import { useState } from "react";

const themes = [
	{ name: "Dark", symbol: "🌙", className: "theme-dark" },
	{ name: "Light", symbol: "☀️", className: "theme-light" },
	{
		name: "Solarized Light",
		symbol: "🌵",
		className: "theme-solarized-light",
	},
	{ name: "Nordic Light", symbol: "❄️", className: "theme-nordic-light" },
] as const;

const ThemeToggle = () => {
	const [themeIndex, setThemeIndex] = useState(0);

	const switchToNextTheme = () => {
		document.body.classList.remove(...themes.map((t) => t.className));

		// Select the next theme
		const currentThemeIndex = (themeIndex + 1) % themes.length;
		setThemeIndex(currentThemeIndex);
		const nextTheme = themes[currentThemeIndex];

		// Apply the new theme class
		document.body.classList.add(nextTheme.className);
	};

	return (
		<button
			type={"button"}
			className="theme-toggle"
			onClick={switchToNextTheme}
			aria-label={`Switch to ${themes[(themeIndex + 1) % themes.length].name}`}
			title={`Switch to ${themes[(themeIndex + 1) % themes.length].name}`}
		>
			{themes[(themeIndex + 1) % themes.length].symbol}
		</button>
	);
};

export default ThemeToggle;
