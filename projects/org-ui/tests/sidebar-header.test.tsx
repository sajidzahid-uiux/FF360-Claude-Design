import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SidebarHeader, ThemeModeEnum, ThemeProvider } from '../src';

describe('SidebarHeader', () => {
  it('uses black logo background in light mode', () => {
    render(
      <ThemeProvider defaultMode={ThemeModeEnum.LIGHT}>
        <SidebarHeader title="FieldFlow" logo={<span>FF</span>} />
      </ThemeProvider>
    );

    const logoWrap = screen.getByText('FF').parentElement;
    expect(logoWrap).toHaveStyle({ backgroundColor: 'rgb(0, 0, 0)' });
  });

  it('hides title in collapsed state', () => {
    render(
      <ThemeProvider defaultMode={ThemeModeEnum.DARK}>
        <SidebarHeader title="FieldFlow" logo={<span>FF</span>} isCollapsed />
      </ThemeProvider>
    );

    expect(screen.queryByText('FieldFlow')).not.toBeInTheDocument();
  });
});
