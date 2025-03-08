// src/components/ThemeSelector.tsx
import { useContext } from 'react';
import { ThemeContext, ThemeName } from '../../contexts/ThemeContext.tsx';
import './ThemeSelector.css';

const ThemeSelector = () => {
    const { theme, setTheme, availableThemes } = useContext(ThemeContext);

    const formatThemeName = (themeName: ThemeName): string => {
        return themeName.replace('-theme', '').split('-').map(
            word => word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    return (
        <div className="theme-selector">
            <label htmlFor="theme-select">Theme:</label>
            <select
                id="theme-select"
                value={theme}
                onChange={(e) => setTheme(e.target.value as ThemeName)}
                aria-label="Select theme"
            >
                {availableThemes.map((themeName) => (
                    <option key={themeName} value={themeName}>
                        {formatThemeName(themeName)}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default ThemeSelector;