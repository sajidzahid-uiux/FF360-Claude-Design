import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { DynamicFavicon, ThemeProvider } from '../src';

describe('DynamicFavicon', () => {
  beforeEach(() => {
    document.head
      .querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]')
      .forEach((node) => node.remove());
  });

  it('creates favicon link and applies data url with provided color', () => {
    render(
      <ThemeProvider>
        <DynamicFavicon color="#123456" />
      </ThemeProvider>
    );

    const icon = document.head.querySelector('link[rel="icon"]');
    expect(icon).not.toBeNull();
    expect(icon?.getAttribute('href')).toContain('data:image/svg+xml,');
    expect(icon?.getAttribute('href')).toContain('%23123456');
  });
});
