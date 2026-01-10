import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const { updateUser } = useAuth();

    const handleToggle = () => {
        toggleTheme();
        const newTheme = theme === 'light' ? 'dark' : 'light';
        updateUser({ theme: newTheme });
    };

    return (
        <button
            type="button"
            className={`theme-toggle ${theme}`}
            onClick={handleToggle}
            aria-label="Toggle theme"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
            <div className="toggle-track">
                <div className="toggle-thumb">
                    {theme === 'light' ? <Sun size={16} /> : <Moon size={16} />}
                </div>
            </div>
        </button>
    );
};

export default ThemeToggle;
