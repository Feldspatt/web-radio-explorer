// src/components/ThemeToggle.tsx
import { useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
    const { theme, toggleTheme, availableThemes } = useContext(ThemeContext);

    // Get aria label for accessibility
    const getNextTheme = () => {
        const currentIndex = availableThemes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % availableThemes.length;
        return availableThemes[nextIndex];
    };

    return (
        <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${getNextTheme().name} mode`}
            title={`Switch to ${getNextTheme().name} mode`}
        >
            {theme.symbol}
        </button>
    );
};

export default ThemeToggle;