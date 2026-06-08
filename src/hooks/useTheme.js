import { useEffect, useState } from 'react';
import { loadTheme, saveTheme } from '../utils/storage';

export function useTheme() {
  const [theme, setTheme] = useState(() => loadTheme());

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    saveTheme(theme);
  }, [theme]);

  return { theme, setTheme };
}
