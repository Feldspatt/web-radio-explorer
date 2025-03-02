import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';
import './ThemeToggle.css'; // We'll create this next

const ThemeToggle = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark-theme' ? 'light' : 'dark'} mode`}
        >
            {theme === 'dark-theme' ? '☀️' : '🌙'}
        </button>
    );
};

export default ThemeToggle;