// src/components/ThemeToggle.tsx
import { useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
    const { theme, toggleTheme, availableThemes } = useContext(ThemeContext);

    // Get theme icon based on current theme
    const getThemeIcon = () => {
        switch (theme) {
            case 'light-theme':
                return '☀️';
            case 'dark-theme':
                return '🌙';
            case 'blue-theme':
                return '🌊';
            case 'green-theme':
                return '🌿';
            case 'high-contrast-theme':
                return '👁️';
            default:
                return '⚙️';
        }
    };

    // Get aria label for accessibility
    const getNextThemeName = () => {
        const currentIndex = availableThemes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % availableThemes.length;
        return availableThemes[nextIndex].replace('-theme', '');
    };

    return (
        <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${getNextThemeName()} mode`}
            title={`Switch to ${getNextThemeName()} mode`}
        >
            {getThemeIcon()}
        </button>
    );
};

export default ThemeToggle;