import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  ThemeModeEnum,
  type ResolvedThemeMode,
  type ThemeMode,
} from '../constants';
import { colors } from './colors';
import { darkTheme, lightTheme, nightTheme, Theme } from './themes';

const MODE_CYCLE: ThemeMode[] = [
  ThemeModeEnum.LIGHT,
  ThemeModeEnum.DARK,
  ThemeModeEnum.NIGHT,
  ThemeModeEnum.SYSTEM,
];

function isStoredThemeMode(value: string | null): value is ThemeMode {
  return (
    value === ThemeModeEnum.LIGHT ||
    value === ThemeModeEnum.DARK ||
    value === ThemeModeEnum.NIGHT ||
    value === ThemeModeEnum.SYSTEM
  );
}

function subscribePrefersDark(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = () => {
    onStoreChange();
  };
  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
}

function getPrefersDarkSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function getPrefersDarkServerSnapshot(): boolean {
  return false;
}

export function resolveThemeMode(
  stored: ThemeMode,
  prefersDark: boolean
): ResolvedThemeMode {
  if (stored === ThemeModeEnum.SYSTEM) {
    return prefersDark ? ThemeModeEnum.DARK : ThemeModeEnum.LIGHT;
  }
  return stored;
}

function applyResolvedDocumentPalette(resolved: ResolvedThemeMode): void {
  if (typeof document === 'undefined') return;

  document.documentElement.setAttribute('data-theme', resolved);
  const htmlEl = document.documentElement;
  const bodyEl = document.body;

  htmlEl.classList.remove('dark', 'night');
  bodyEl?.classList.remove('dark', 'night');

  if (resolved === ThemeModeEnum.LIGHT) {
    return;
  }
  if (resolved === ThemeModeEnum.DARK) {
    htmlEl.classList.add('dark');
    bodyEl?.classList.add('dark');
    return;
  }
  htmlEl.classList.add('dark', 'night');
  bodyEl?.classList.add('dark', 'night');
}

/** Optional pointer origin for the Telegram-style circular theme reveal. */
export interface ThemeTransitionOptions {
  origin?: { clientX: number; clientY: number };
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function computeRevealRadiusPx(x: number, y: number): number {
  if (typeof window === 'undefined') return 2000;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const left = x;
  const top = y;
  const right = w - x;
  const bottom = h - y;
  return Math.hypot(Math.max(left, right), Math.max(top, bottom)) + 16;
}

function runWaveStyleThemeTransition(
  updateDom: () => void,
  options?: ThemeTransitionOptions
): void {
  if (typeof document === 'undefined') {
    updateDom();
    return;
  }
  const doc = document;
  if (typeof doc.startViewTransition !== 'function' || prefersReducedMotion()) {
    updateDom();
    return;
  }

  const vt = doc.startViewTransition(updateDom);

  const w = window.innerWidth;
  const h = window.innerHeight;
  const x = options?.origin?.clientX ?? w / 2;
  const y = options?.origin?.clientY ?? h / 2;
  const maxRadius = computeRevealRadiusPx(x, y);

  const reveal = () => {
    doc.documentElement.animate(
      [
        { clipPath: `circle(0px at ${x}px ${y}px)` },
        { clipPath: `circle(${maxRadius}px at ${x}px ${y}px)` },
      ],
      {
        duration: 480,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        pseudoElement: '::view-transition-new(root)',
        fill: 'both',
      }
    );
  };

  void vt.ready.then(reveal).catch(() => {
    /* ignore: transition aborted or unsupported path */
  });
}

interface ThemeContextType {
  theme: Theme;
  /** Stored preference (may be `system`). */
  mode: ThemeMode;
  /** Palette applied to tokens and the document (system → light or dark). */
  resolvedMode: ResolvedThemeMode;
  accentColor: string;
  setAccentColor: (color: string) => void;
  setMode: (mode: ThemeMode, options?: ThemeTransitionOptions) => void;
  toggleMode: (options?: ThemeTransitionOptions) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: ThemeMode;
  storageKey?: string;
  /** Initial accent fill color (hex/CSS color). Default: `colors.accent` (#d9f46e). */
  defaultAccentColor?: string;
  /** When set, persists `accentColor` in `localStorage` under this key. */
  accentStorageKey?: string;
}

export function ThemeProvider({
  children,
  defaultMode = ThemeModeEnum.LIGHT,
  storageKey = 'ui-theme-mode',
  defaultAccentColor = colors.accent,
  accentStorageKey,
}: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(defaultMode);
  const [accentColor, setAccentColorState] = useState(defaultAccentColor);
  const [hasHydratedFromStorage, setHasHydratedFromStorage] = useState(false);
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const prefersDark = useSyncExternalStore(
    subscribePrefersDark,
    getPrefersDarkSnapshot,
    getPrefersDarkServerSnapshot
  );
  const prefersDarkRef = useRef(prefersDark);
  prefersDarkRef.current = prefersDark;

  const resolvedMode = useMemo(
    () => resolveThemeMode(mode, prefersDark),
    [mode, prefersDark]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedMode = localStorage.getItem(storageKey);
    if (isStoredThemeMode(storedMode)) {
      setModeState(storedMode);
    }

    if (accentStorageKey) {
      const storedAccent = localStorage.getItem(accentStorageKey);
      if (storedAccent) {
        setAccentColorState(storedAccent);
      }
    }

    setHasHydratedFromStorage(true);
  }, [storageKey, accentStorageKey]);

  const theme = useMemo<Theme>(() => {
    const base =
      resolvedMode === ThemeModeEnum.LIGHT
        ? lightTheme
        : resolvedMode === ThemeModeEnum.DARK
          ? darkTheme
          : nightTheme;
    return {
      ...base,
      accent: {
        ...base.accent,
        bg: accentColor,
      },
    };
  }, [resolvedMode, accentColor]);

  useEffect(() => {
    if (!hasHydratedFromStorage) return;
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, mode);
    }
    applyResolvedDocumentPalette(resolvedMode);
  }, [hasHydratedFromStorage, mode, resolvedMode, storageKey]);

  useEffect(() => {
    if (!hasHydratedFromStorage) return;
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--color-accent', accentColor);
    }
  }, [accentColor, hasHydratedFromStorage]);

  const setAccentColor = useCallback(
    (color: string) => {
      setAccentColorState(color);
      if (typeof window !== 'undefined' && accentStorageKey) {
        localStorage.setItem(accentStorageKey, color);
      }
    },
    [accentStorageKey]
  );

  const commitModeChange = useCallback(
    (nextMode: ThemeMode, transitionOptions?: ThemeTransitionOptions) => {
      if (nextMode === modeRef.current) return;

      const apply = () => {
        const nextResolved = resolveThemeMode(nextMode, prefersDarkRef.current);
        setModeState(nextMode);
        modeRef.current = nextMode;
        applyResolvedDocumentPalette(nextResolved);
      };

      if (hasHydratedFromStorage) {
        runWaveStyleThemeTransition(apply, transitionOptions);
      } else {
        apply();
      }
    },
    [hasHydratedFromStorage]
  );

  const setMode = useCallback(
    (newMode: ThemeMode, transitionOptions?: ThemeTransitionOptions) => {
      commitModeChange(newMode, transitionOptions);
    },
    [commitModeChange]
  );

  const toggleMode = useCallback((transitionOptions?: ThemeTransitionOptions) => {
    const prev = modeRef.current;
    const i = MODE_CYCLE.indexOf(prev);
    const next = MODE_CYCLE[(i + 1) % MODE_CYCLE.length];
    commitModeChange(next, transitionOptions);
  }, [commitModeChange]);

  const contextValue = useMemo(
    () => ({
      theme,
      mode,
      resolvedMode,
      accentColor,
      setAccentColor,
      setMode,
      toggleMode,
    }),
    [theme, mode, resolvedMode, accentColor, setAccentColor, setMode, toggleMode]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
