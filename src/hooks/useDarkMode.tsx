
import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'oled' | 'system';

export function useDarkMode() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'system';
    }
    return 'system';
  });

  const [isDark, setIsDark] = useState(false);
  const [isOled, setIsOled] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateTheme = () => {
      let darkMode = false;
      let oledMode = false;

      if (theme === 'system') {
        darkMode = mediaQuery.matches;
      } else if (theme === 'dark') {
        darkMode = true;
      } else if (theme === 'oled') {
        darkMode = true;
        oledMode = true;
      }

      setIsDark(darkMode);
      setIsOled(oledMode);
      
      // Apply theme classes
      document.documentElement.classList.toggle('dark', darkMode);
      document.documentElement.classList.toggle('oled', oledMode);
      
      // Set CSS custom properties for true black
      if (oledMode) {
        document.documentElement.style.setProperty('--background', '0 0% 0%');
        document.documentElement.style.setProperty('--surface', '0 0% 4%');
        document.documentElement.style.setProperty('--card', '0 0% 0%');
        document.documentElement.style.setProperty('--muted', '0 0% 4%');
        document.documentElement.style.setProperty('--accent', '0 0% 4%');
        document.documentElement.style.setProperty('--border', '0 0% 6%');
        document.documentElement.style.setProperty('--input', '0 0% 4%');
      } else if (darkMode) {
        // Regular dark mode values
        document.documentElement.style.removeProperty('--background');
        document.documentElement.style.removeProperty('--surface');
        document.documentElement.style.removeProperty('--card');
        document.documentElement.style.removeProperty('--muted');
        document.documentElement.style.removeProperty('--accent');
        document.documentElement.style.removeProperty('--border');
        document.documentElement.style.removeProperty('--input');
      }
    };

    updateTheme();
    
    if (theme === 'system') {
      mediaQuery.addEventListener('change', updateTheme);
      return () => mediaQuery.removeEventListener('change', updateTheme);
    }
  }, [theme]);

  const setThemeMode = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const cycleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'oled'];
    const currentIndex = themes.indexOf(theme === 'system' ? (isDark ? 'dark' : 'light') : theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setThemeMode(themes[nextIndex]);
  };

  return {
    theme,
    isDark,
    isOled,
    setTheme: setThemeMode,
    cycleTheme,
    toggleTheme: () => setThemeMode(isDark ? 'light' : 'oled')
  };
}
