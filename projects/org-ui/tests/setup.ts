import '@testing-library/jest-dom/vitest';

const mediaNoop = () => {};

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: mediaNoop,
    removeListener: mediaNoop,
    addEventListener: mediaNoop,
    removeEventListener: mediaNoop,
    dispatchEvent: () => false,
  }),
});
