
import { useTheme } from 'next-themes';

export function useDarkMode() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const isDark = resolvedTheme === 'dark' || resolvedTheme === 'oled';
  const isOled = resolvedTheme === 'oled';

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('oled');
    } else {
      setTheme('light');
    }
  };

  const cycleTheme = () => {
    const themes = ['light', 'dark', 'oled'];
    const currentIndex = themes.indexOf(theme as string);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return {
    theme,
    isDark,
    isOled,
    setTheme,
    toggleTheme,
    cycleTheme,
    resolvedTheme
  };
}
