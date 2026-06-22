import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeModeEnum } from '../src/constants';
import { ThemeProvider, useTheme } from '../src/theme/ThemeProvider';

let mockPrefersDark = false;

function ThemeHarness() {
  const { mode, accentColor, toggleMode, setAccentColor } = useTheme();

  return (
    <div>
      <p data-testid="mode">{mode}</p>
      <p data-testid="accent">{accentColor}</p>
      <button type="button" onClick={() => toggleMode()}>
        Toggle
      </button>
      <button type="button" onClick={() => setAccentColor('#123456')}>
        Set accent
      </button>
    </div>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    mockPrefersDark = false;
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.className = '';
    document.body.className = '';
    document.documentElement.style.removeProperty('--color-accent');

    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)' ? mockPrefersDark : false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('initializes with default mode and toggles through modes including system', () => {
    render(
      <ThemeProvider defaultMode={ThemeModeEnum.LIGHT}>
        <ThemeHarness />
      </ThemeProvider>
    );

    expect(screen.getByTestId('mode')).toHaveTextContent('light');
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');

    fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('night')).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(screen.getByTestId('mode')).toHaveTextContent('night');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('night')).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(screen.getByTestId('mode')).toHaveTextContent('system');
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(document.documentElement.classList.contains('night')).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(screen.getByTestId('mode')).toHaveTextContent('light');
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  });

  it('system mode resolves to dark when prefers-color-scheme is dark', () => {
    mockPrefersDark = true;
    render(
      <ThemeProvider defaultMode={ThemeModeEnum.SYSTEM}>
        <ThemeHarness />
      </ThemeProvider>
    );

    expect(screen.getByTestId('mode')).toHaveTextContent('system');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('night')).toBe(false);
  });

  it('persists accent color and updates css variable', () => {
    render(
      <ThemeProvider accentStorageKey="test-accent-key" defaultAccentColor="#abcdef">
        <ThemeHarness />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Set accent' }));

    expect(screen.getByTestId('accent')).toHaveTextContent('#123456');
    expect(localStorage.getItem('test-accent-key')).toBe('#123456');
    expect(document.documentElement.style.getPropertyValue('--color-accent')).toBe(
      '#123456'
    );
  });
});
