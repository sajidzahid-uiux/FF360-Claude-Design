import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Modal } from '../src/components/system-components/Modal';
import { modalMobileFullscreenClassName } from '../src/utils/modalShell';

describe('Modal mobile shell', () => {
  it('applies fullscreen mobile classes to the dialog panel', () => {
    const { container } = render(
      <Modal isOpen onClose={() => {}} title="Edit organization">
        <p>Form body</p>
      </Modal>
    );

    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).toBeInTheDocument();
    expect(dialog?.className).toContain('max-[820px]:fixed');
    expect(modalMobileFullscreenClassName.split(' ').every((token) => token.length > 0)).toBe(
      true
    );
    expect(screen.getByText('Form body')).toBeInTheDocument();
  });
});
