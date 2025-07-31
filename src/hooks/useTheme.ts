import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  systemTheme: 'light' | 'dark';
  accentColor: string;
}

const STORAGE_KEY = 'repdf-theme';
const ACCENT_STORAGE_KEY = 'repdf-accent-color';
const DEFAULT_ACCENT = '#06b6d4';

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme: 'light' | 'dark', accentColor: string) => {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  
  // Apply accent color variations
  const hsl = hexToHSL(accentColor);
  if (hsl) {
    generateAccentVariations(hsl);
  }
};

const hexToHSL = (hex: string): { h: number; s: number; l: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
};

const generateAccentVariations = (hsl: { h: number; s: number; l: number }) => {
  const root = document.documentElement;
  const { h, s } = hsl;
  
  // Generate lightness variations
  const variations = [
    { suffix: '50', l: 95 },
    { suffix: '100', l: 90 },
    { suffix: '200', l: 80 },
    { suffix: '300', l: 70 },
    { suffix: '400', l: 60 },
    { suffix: '500', l: 50 }, // Main color
    { suffix: '600', l: 40 },
    { suffix: '700', l: 30 },
    { suffix: '800', l: 20 },
    { suffix: '900', l: 10 },
    { suffix: '950', l: 5 },
  ];

  variations.forEach(({ suffix, l }) => {
    root.style.setProperty(`--color-primary-${suffix}`, `hsl(${h}, ${s}%, ${l}%)`);
  });
};

export const useTheme = (): ThemeState & {
  setTheme: (theme: Theme) => void;
  setAccentColor: (color: string) => void;
  toggleTheme: () => void;
} => {
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(getSystemTheme);
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system';
    return (localStorage.getItem(STORAGE_KEY) as Theme) || 'system';
  });
  const [accentColor, setAccentColorState] = useState<string>(() => {
    if (typeof window === 'undefined') return DEFAULT_ACCENT;
    return localStorage.getItem(ACCENT_STORAGE_KEY) || DEFAULT_ACCENT;
  });

  const resolvedTheme = theme === 'system' ? systemTheme : theme;

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply theme when it changes
  useEffect(() => {
    applyTheme(resolvedTheme, accentColor);
  }, [resolvedTheme, accentColor]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
  }, []);

  const setAccentColor = useCallback((color: string) => {
    setAccentColorState(color);
    localStorage.setItem(ACCENT_STORAGE_KEY, color);
  }, []);

  const toggleTheme = useCallback(() => {
    if (theme === 'system') {
      setTheme(systemTheme === 'light' ? 'dark' : 'light');
    } else {
      setTheme(theme === 'light' ? 'dark' : 'light');
    }
  }, [theme, systemTheme, setTheme]);

  return {
    theme,
    resolvedTheme,
    systemTheme,
    accentColor,
    setTheme,
    setAccentColor,
    toggleTheme,
  };
};