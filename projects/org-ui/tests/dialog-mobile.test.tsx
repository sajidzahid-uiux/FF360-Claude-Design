import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { Dialog } from '../src/components/system-components/Dialog';
import { ThemeModeEnum } from '../src/constants';
import { ThemeProvider } from '../src/theme';

function renderWithTheme(ui: ReactElement) {
  return render(
    <ThemeProvider defaultMode={ThemeModeEnum.LIGHT}>{ui}</ThemeProvider>
  );
}

describe('Dialog mobile layout', () => {
  it('uses compact shell classes instead of fullscreen modal classes', () => {
    const { container } = renderWithTheme(
      <Dialog
        isOpen
        onClose={() => {}}
        onConfirm={() => {}}
        title="Delete organization?"
        description="This action cannot be undone."
        confirmLabel="Delete organization"
        cancelLabel="Cancel"
        variant="danger"
      />
    );

    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).toBeInTheDocument();
    expect(dialog?.className).toContain('max-[820px]:max-w-md');
    expect(dialog?.className).not.toContain('max-[820px]:fixed');
    expect(dialog?.className).not.toContain('max-[820px]:justify-between');
  });

  it('stacks action buttons for narrow layouts', () => {
    const { container } = renderWithTheme(
      <Dialog
        isOpen
        onClose={() => {}}
        onConfirm={() => {}}
        title="Confirm"
        confirmLabel="Delete organization"
      />
    );

    const actions = container.querySelector('[role="dialog"]')?.lastElementChild;
    expect(actions?.className).toContain('max-[820px]:flex-col');
    expect(screen.getByRole('button', { name: 'Delete organization' })).toBeInTheDocument();
  });
});
