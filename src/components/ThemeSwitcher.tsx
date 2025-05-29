import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeSwitcherProps {
  onThemeChange: (theme: Theme) => void;
  currentTheme: Theme;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ 
  onThemeChange, 
  currentTheme 
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleThemeChange = (theme: Theme) => {
    onThemeChange(theme);
    
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="flex items-center space-x-2 p-2 rounded-md bg-gray-100 dark:bg-gray-800" role="radiogroup" aria-label="Theme selection">
      <button
        onClick={() => handleThemeChange('light')}
        className={`p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
          currentTheme === 'light' 
            ? 'bg-white dark:bg-gray-700 text-yellow-500 shadow-sm' 
            : 'text-gray-500 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400'
        }`}
        aria-label="Light theme"
        aria-pressed={currentTheme === 'light'}
        role="radio"
      >
        <Sun className="h-5 w-5" />
        <span className="sr-only">Light</span>
      </button>
      
      <button
        onClick={() => handleThemeChange('dark')}
        className={`p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
          currentTheme === 'dark' 
            ? 'bg-white dark:bg-gray-700 text-indigo-500 shadow-sm' 
            : 'text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400'
        }`}
        aria-label="Dark theme"
        aria-pressed={currentTheme === 'dark'}
        role="radio"
      >
        <Moon className="h-5 w-5" />
        <span className="sr-only">Dark</span>
      </button>
      
      <button
        onClick={() => handleThemeChange('system')}
        className={`p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
          currentTheme === 'system' 
            ? 'bg-white dark:bg-gray-700 text-blue-500 shadow-sm' 
            : 'text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400'
        }`}
        aria-label="System theme"
        aria-pressed={currentTheme === 'system'}
        role="radio"
      >
        <Monitor className="h-5 w-5" />
        <span className="sr-only">System</span>
      </button>
    </div>
  );
};

export default ThemeSwitcher;
