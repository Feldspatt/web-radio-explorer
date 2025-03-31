import "../style/ThemeToggle.css";
import {useEffect, useState} from "react";
import {loadTheme, storeTheme} from "../services/storage.ts";

const themes: Theme[] = [
	{ name: "Dark", symbol: "🌙", className: "theme-dark" },
	{ name: "Neon Light", symbol: "⚡", className: "theme-neon-light" },
	{ name: "Monokai", symbol: "🌈", className: "theme-monokai" },
	{ name: "Groovbox", symbol: "🍂", className: "theme-groovbox" },
	{ name: "Atom", symbol: "⚛️", className: "theme-atom" },
	{ name: "Light", symbol: "☀️", className: "theme-light" },
	{ name: "Cahier", symbol: "📜", className: "theme-cahier" },
	{ name: "Nordic Light", symbol: "❄️", className: "theme-nordic-light" },
	{ name: "Solarized Light", symbol: "🌵", className: "theme-solarized-light" },
] as const;

const ThemeToggle = () => {
	const [themeIndex, setThemeIndex] = useState<number>(Math.max(0, themes.findIndex(theme => theme.name === loadTheme())));

	useEffect(() => {
		document.body.classList.remove(...themes.map((t) => t.className));
		const theme = themes[themeIndex];
		document.body.classList.add(theme.className);
		storeTheme(theme.name)
	}, [themeIndex]);

	const switchToNextTheme = () => {
		setThemeIndex(prevState => (prevState + 1)% themes.length);
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
