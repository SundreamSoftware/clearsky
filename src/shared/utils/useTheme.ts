import { useCallback, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // localStorage may be unavailable in some contexts
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const t = readStoredTheme();
    applyTheme(t);
    return t;
  });

  // Keep in sync if another tab changes localStorage
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === 'theme' && (e.newValue === 'light' || e.newValue === 'dark')) {
        applyTheme(e.newValue);
        setTheme(e.newValue);
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', next);
      applyTheme(next);
      return next;
    });
  }, []);

  return { theme, toggleTheme, isDark: theme === 'dark' };
}
