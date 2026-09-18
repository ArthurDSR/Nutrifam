import { useState, useEffect } from 'react';

export type ThemeMode = 'system' | 'light' | 'dark';

export type SecondaryColor =
  | 'mint'
  | 'lavender'
  | 'peach'
  | 'sky'
  | 'rose'
  | 'butter'
  | 'matcha';

export interface PastelColorOption {
  id: SecondaryColor;
  label: string;
  emoji: string;
  primary: string;       // Accent hex for active icons, active tab, buttons
  pastel: string;        // Soft pastel badge/pill background
  bgTintLight: string;   // Gentle tinted background in light mode
  textDark: string;      // High-contrast readable text in light mode (AA standard)
  border: string;        // Subtle border in light mode
  darkBg: string;        // Soft cozy tinted surface in dark mode
  darkBorder: string;    // Soft cozy border in dark mode
  darkText: string;      // Readable pastel text in dark mode
}

export const PASTEL_COLORS: Record<SecondaryColor, PastelColorOption> = {
  mint: {
    id: 'mint',
    label: 'Sálvia',
    emoji: '🌿',
    primary: '#6F8F80',
    pastel: '#E8EFEA',
    bgTintLight: '#F2F5F1',
    textDark: '#405D50',
    border: '#C8D8CF',
    darkBg: '#26352F',
    darkBorder: '#41574E',
    darkText: '#BDD2C7'
  },
  lavender: {
    id: 'lavender',
    label: 'Lavanda',
    emoji: '🌸',
    primary: '#81789B',
    pastel: '#EFEDF4',
    bgTintLight: '#F7F5F8',
    textDark: '#514B67',
    border: '#D8D2E2',
    darkBg: '#302D39',
    darkBorder: '#4C465B',
    darkText: '#CEC8DC'
  },
  peach: {
    id: 'peach',
    label: 'Pêssego',
    emoji: '🍑',
    primary: '#A97863',
    pastel: '#F5EAE4',
    bgTintLight: '#FAF5F1',
    textDark: '#6B4739',
    border: '#E7D0C5',
    darkBg: '#392C27',
    darkBorder: '#5B443A',
    darkText: '#E5C5B5'
  },
  sky: {
    id: 'sky',
    label: 'Céu',
    emoji: '🌊',
    primary: '#6F92A1',
    pastel: '#E8F0F3',
    bgTintLight: '#F2F6F7',
    textDark: '#405D69',
    border: '#CADDE3',
    darkBg: '#27343A',
    darkBorder: '#41545D',
    darkText: '#BED2DA'
  },
  rose: {
    id: 'rose',
    label: 'Rosa antigo',
    emoji: '🌺',
    primary: '#A47786',
    pastel: '#F3E9EC',
    bgTintLight: '#F9F4F5',
    textDark: '#674750',
    border: '#E3CED5',
    darkBg: '#382C30',
    darkBorder: '#58434A',
    darkText: '#DFC3CC'
  },
  butter: {
    id: 'butter',
    label: 'Baunilha',
    emoji: '🍋',
    primary: '#9A8250',
    pastel: '#F4EFE1',
    bgTintLight: '#FAF7EF',
    textDark: '#62512E',
    border: '#E6DABB',
    darkBg: '#373225',
    darkBorder: '#554A31',
    darkText: '#DDD0A9'
  },
  matcha: {
    id: 'matcha',
    label: 'Matcha',
    emoji: '🍵',
    primary: '#788864',
    pastel: '#EDF0E7',
    bgTintLight: '#F5F6F1',
    textDark: '#4C5A3D',
    border: '#D4DCC8',
    darkBg: '#2D3428',
    darkBorder: '#48543E',
    darkText: '#C6D0B7'
  }
};

const THEME_STORAGE_KEY = 'nutrifam_theme_settings';
const LEGACY_THEME_STORAGE_KEY = 'nutrimonitor_theme_settings';
const THEME_CHANGE_EVENT = 'nutrifam_theme_change';

export interface ThemeSettings {
  mode: ThemeMode;
  secondaryColor: SecondaryColor;
}

const DEFAULT_SETTINGS: ThemeSettings = {
  mode: 'system',
  secondaryColor: 'mint'
};

export function isSystemDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function resolveIsDark(mode: ThemeMode): boolean {
  if (mode === 'dark') return true;
  if (mode === 'light') return false;
  return isSystemDark();
}

export function getStoredThemeSettings(): ThemeSettings {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem(LEGACY_THEME_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      mode: ['system', 'light', 'dark'].includes(parsed.mode) ? parsed.mode : 'system',
      secondaryColor: PASTEL_COLORS[parsed.secondaryColor as SecondaryColor]
        ? parsed.secondaryColor
        : 'mint'
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Synchronously and immediately applies the theme classes and CSS variables to the DOM
 */
export function applyThemeToDom(settings: ThemeSettings): boolean {
  if (typeof document === 'undefined') return false;

  const isDark = resolveIsDark(settings.mode);
  const activeColor = PASTEL_COLORS[settings.secondaryColor] || PASTEL_COLORS.mint;
  const root = document.documentElement;

  if (isDark) {
    root.classList.add('dark');
    root.dataset.theme = 'dark';
  } else {
    root.classList.remove('dark');
    root.dataset.theme = 'light';
  }

  // `only light` explicitly opts out of Android/Chrome automatic darkening.
  // A plain `light` value still allows some browsers to transform page colors.
  root.style.colorScheme = isDark ? 'dark' : 'only light';

  // Cozy Pastel Design System CSS Tokens
  const canvasBg = isDark ? '#18201D' : '#F7F4EE';
  const cardBg = isDark ? '#232D29' : '#FFFCF7';
  const textMain = isDark ? '#EDF2EF' : '#3F4B46';
  const textMuted = isDark ? '#A8B8B1' : '#6F7C76';
  const strokeBorder = isDark ? '#394842' : '#D8DED9';

  root.style.setProperty('--app-canvas-bg', canvasBg);
  root.style.setProperty('--app-card-bg', cardBg);
  root.style.setProperty('--app-text-main', textMain);
  root.style.setProperty('--app-text-muted', textMuted);
  root.style.setProperty('--app-border', strokeBorder);

  // Dynamic Secondary Pastel Color Tokens
  root.style.setProperty('--color-secondary-primary', activeColor.primary);
  root.style.setProperty('--color-secondary-pastel', activeColor.pastel);
  root.style.setProperty('--color-secondary-border', activeColor.border);
  root.style.setProperty('--color-secondary-text', activeColor.textDark);
  root.style.setProperty('--color-secondary-dark-bg', activeColor.darkBg);
  root.style.setProperty('--color-secondary-dark-border', activeColor.darkBorder);
  root.style.setProperty('--color-secondary-dark-text', activeColor.darkText);

  // Sync mobile browser status bar & theme-color
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', canvasBg);
  }

  const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
  if (metaColorScheme) {
    metaColorScheme.setAttribute('content', isDark ? 'dark' : 'only light');
  }

  return isDark;
}

export function saveThemeSettings(settings: ThemeSettings): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(settings));
    // Apply to DOM immediately
    applyThemeToDom(settings);
    // Broadcast event for active components
    window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: settings }));
  } catch (e) {
    console.error('Failed to save theme settings:', e);
  }
}

// Initial eager execution on script load to eliminate any theme flashing or stale state
if (typeof window !== 'undefined') {
  try {
    applyThemeToDom(getStoredThemeSettings());
  } catch (err) {
    console.error('Initial theme apply error:', err);
  }
}

/**
 * Custom React hook for dynamic theme settings and real-time reactive updates
 */
export function useTheme() {
  const [settings, setSettings] = useState<ThemeSettings>(getStoredThemeSettings);
  const [systemDark, setSystemDark] = useState<boolean>(isSystemDark);

  useEffect(() => {
    // Media query listener for device scheme changes
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const mqHandler = (e: MediaQueryListEvent) => {
      setSystemDark(e.matches);
      const curSettings = getStoredThemeSettings();
      if (curSettings.mode === 'system') {
        applyThemeToDom(curSettings);
      }
    };

    if (mq.addEventListener) {
      mq.addEventListener('change', mqHandler);
    } else {
      mq.addListener(mqHandler);
    }

    // App-internal change listener
    const onThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<ThemeSettings>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
        applyThemeToDom(customEvent.detail);
      } else {
        const fresh = getStoredThemeSettings();
        setSettings(fresh);
        applyThemeToDom(fresh);
      }
    };
    window.addEventListener(THEME_CHANGE_EVENT, onThemeChange);

    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener('change', mqHandler);
      } else {
        mq.removeListener(mqHandler);
      }
      window.removeEventListener(THEME_CHANGE_EVENT, onThemeChange);
    };
  }, []);

  const isDark = settings.mode === 'dark' || (settings.mode === 'system' && systemDark);
  const activeColor = PASTEL_COLORS[settings.secondaryColor] || PASTEL_COLORS.mint;

  const setMode = (mode: ThemeMode) => {
    const next: ThemeSettings = { ...settings, mode };
    setSettings(next);
    saveThemeSettings(next);
  };

  const setSecondaryColor = (secondaryColor: SecondaryColor) => {
    const next: ThemeSettings = { ...settings, secondaryColor };
    setSettings(next);
    saveThemeSettings(next);
  };

  return {
    mode: settings.mode,
    secondaryColor: settings.secondaryColor,
    isDark,
    activeColor,
    setMode,
    setSecondaryColor
  };
}
