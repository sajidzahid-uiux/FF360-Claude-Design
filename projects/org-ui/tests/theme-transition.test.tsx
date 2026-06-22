import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FieldFlowAppLayout } from '../src/components/system-components/AppLayout';
import { ThemeModeEnum } from '../src/constants';
import { ThemeProvider, useTheme } from '../src/theme';

function ThemeTransitionHarness() {
  const { toggleMode, setMode } = useTheme();
  return (
    <div>
      <button type="button" onClick={() => toggleMode()}>
        Toggle
      </button>
      <button
        type="button"
        onClick={() =>
          setMode(ThemeModeEnum.DARK, {
            origin: { clientX: 12, clientY: 34 },
          })
        }
      >
        Set dark from origin
      </button>
    </div>
  );
}

function mockAnimateOnDocumentElement() {
  const animateMock = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
  });
  Object.defineProperty(document.documentElement, 'animate', {
    configurable: true,
    writable: true,
    value: animateMock,
  });
  return animateMock;
}

function removeDocumentElementAnimateMock() {
  Reflect.deleteProperty(document.documentElement, 'animate');
}

/** Minimal `ViewTransition` for tests (ThemeProvider only awaits `ready`). */
function createStubViewTransition(): ViewTransition {
  const settled = Promise.resolve();
  return {
    finished: settled,
    ready: settled,
    updateCallbackDone: settled,
    skipTransition: () => {},
    types: new Set(),
  } as ViewTransition;
}

describe('ThemeProvider view transition (theme switch animation)', () => {
  const originalStartViewTransition = document.startViewTransition?.bind(document);

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.className = '';
    document.body.className = '';
    document.documentElement.style.removeProperty('--color-accent');
  });

  afterEach(() => {
    removeDocumentElementAnimateMock();
    if (originalStartViewTransition) {
      document.startViewTransition = originalStartViewTransition;
    } else {
      Reflect.deleteProperty(document, 'startViewTransition');
    }
    vi.restoreAllMocks();
  });

  it('runs clip-path reveal with cubic-bezier easing after startViewTransition is ready', async () => {
    const animateMock = mockAnimateOnDocumentElement();
    const startViewTransitionSpy = vi.fn((updateDom?: ViewTransitionUpdateCallback) => {
      void updateDom?.();
      return createStubViewTransition();
    });
    document.startViewTransition = startViewTransitionSpy;

    render(
      <ThemeProvider defaultMode={ThemeModeEnum.LIGHT}>
        <ThemeTransitionHarness />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Set dark from origin' }));

    await waitFor(() => {
      expect(startViewTransitionSpy).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(animateMock).toHaveBeenCalledTimes(1);
    });

    const [keyframes, options] = animateMock.mock.calls[0] as [
      Keyframe[],
      KeyframeAnimationOptions,
    ];

    expect(keyframes[0]?.clipPath).toBe('circle(0px at 12px 34px)');
    expect(keyframes[1]?.clipPath).toMatch(/^circle\([\d.]+px at 12px 34px\)$/);

    expect(options).toMatchObject({
      duration: 480,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      pseudoElement: '::view-transition-new(root)',
      fill: 'both',
    });
  });

  it('skips startViewTransition when prefers-reduced-motion is reduce', async () => {
    const animateMock = mockAnimateOnDocumentElement();
    const startViewTransitionSpy = vi.fn((updateDom?: ViewTransitionUpdateCallback) => {
      void updateDom?.();
      return createStubViewTransition();
    });
    document.startViewTransition = startViewTransitionSpy;

    const matchMediaSpy = vi.spyOn(window, 'matchMedia').mockImplementation(
      (query: string) =>
        ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as MediaQueryList
    );

    render(
      <ThemeProvider defaultMode={ThemeModeEnum.LIGHT}>
        <ThemeTransitionHarness />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    expect(startViewTransitionSpy).not.toHaveBeenCalled();
    expect(animateMock).not.toHaveBeenCalled();

    matchMediaSpy.mockRestore();
  });

  it('applies theme immediately when startViewTransition is unavailable', async () => {
    const animateMock = mockAnimateOnDocumentElement();
    Reflect.deleteProperty(document, 'startViewTransition');

    render(
      <ThemeProvider defaultMode={ThemeModeEnum.LIGHT}>
        <ThemeTransitionHarness />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    expect(animateMock).not.toHaveBeenCalled();
  });
});

describe('FieldFlowAppLayout theme switch uses view transition path', () => {
  const originalStartViewTransition = document.startViewTransition?.bind(document);

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.className = '';
    document.body.className = '';
  });

  afterEach(() => {
    removeDocumentElementAnimateMock();
    if (originalStartViewTransition) {
      document.startViewTransition = originalStartViewTransition;
    } else {
      Reflect.deleteProperty(document, 'startViewTransition');
    }
    vi.restoreAllMocks();
  });

  it('invokes startViewTransition and animate when changing appearance from ThemeControls', async () => {
    const animateMock = mockAnimateOnDocumentElement();
    const startViewTransitionSpy = vi.fn((updateDom?: ViewTransitionUpdateCallback) => {
      void updateDom?.();
      return createStubViewTransition();
    });
    document.startViewTransition = startViewTransitionSpy;

    render(
      <ThemeProvider defaultMode={ThemeModeEnum.LIGHT}>
        <FieldFlowAppLayout
          appTitle="FieldFlow"
          logo={<span>FF</span>}
          user={{ fullName: 'Dev', subtitle: 'UI Engineer' }}
          userMenuActions={[]}
          currentPath="/settings/user/appearance"
        >
          <div>Page Content</div>
        </FieldFlowAppLayout>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Theme Mode' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('tab', { name: 'Dark' }), { clientX: 80, clientY: 40 });

    await waitFor(() => {
      expect(startViewTransitionSpy).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(animateMock).toHaveBeenCalled();
    });

    const [keyframes] = animateMock.mock.calls[0] as [Keyframe[]];
    expect(keyframes[0]?.clipPath).toBe('circle(0px at 80px 40px)');
  });

  it('invokes startViewTransition and animate when selecting System from ThemeControls', async () => {
    const animateMock = mockAnimateOnDocumentElement();
    const startViewTransitionSpy = vi.fn((updateDom?: ViewTransitionUpdateCallback) => {
      void updateDom?.();
      return createStubViewTransition();
    });
    document.startViewTransition = startViewTransitionSpy;

    render(
      <ThemeProvider defaultMode={ThemeModeEnum.LIGHT}>
        <FieldFlowAppLayout
          appTitle="FieldFlow"
          logo={<span>FF</span>}
          user={{ fullName: 'Dev', subtitle: 'UI Engineer' }}
          userMenuActions={[]}
          currentPath="/settings/user/appearance"
        >
          <div>Page Content</div>
        </FieldFlowAppLayout>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Theme Mode' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('tab', { name: 'System' }), { clientX: 10, clientY: 20 });

    await waitFor(() => {
      expect(startViewTransitionSpy).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(animateMock).toHaveBeenCalled();
    });

    const [keyframes] = animateMock.mock.calls[0] as [Keyframe[]];
    expect(keyframes[0]?.clipPath).toBe('circle(0px at 10px 20px)');
  });
});
