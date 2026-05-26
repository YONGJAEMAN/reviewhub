import { render, screen, fireEvent, act } from '@testing-library/react';
import Modal from '../Modal';

describe('Modal', () => {
  it('renders children inside a dialog when open', () => {
    render(
      <Modal open onClose={() => {}} ariaLabel="Test">
        <p>Hello</p>
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-label', 'Test');
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders nothing when closed', () => {
    const { container } = render(
      <Modal open={false} onClose={() => {}}>
        <p>Hidden</p>
      </Modal>,
    );
    expect(container.firstChild).toBeNull();
  });

  it('uses labelledby when provided (skips aria-label)', () => {
    render(
      <Modal open onClose={() => {}} labelledBy="modal-h">
        <h2 id="modal-h">Title</h2>
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-h');
    expect(dialog).not.toHaveAttribute('aria-label');
  });

  it('closes on ESC key', () => {
    const onClose = jest.fn();
    render(
      <Modal open onClose={onClose}>
        <button>x</button>
      </Modal>,
    );
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('closes when backdrop is clicked', () => {
    const onClose = jest.fn();
    render(
      <Modal open onClose={onClose}>
        <button>x</button>
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    const backdrop = dialog.parentElement!;
    fireEvent.mouseDown(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it('does not close on backdrop when dismissOnBackdrop=false', () => {
    const onClose = jest.fn();
    render(
      <Modal open onClose={onClose} dismissOnBackdrop={false}>
        <button>x</button>
      </Modal>,
    );
    const backdrop = screen.getByRole('dialog').parentElement!;
    fireEvent.mouseDown(backdrop);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('locks body scroll while open and restores on close', () => {
    document.body.style.overflow = 'auto';
    const { rerender } = render(
      <Modal open onClose={() => {}}>
        <p>x</p>
      </Modal>,
    );
    expect(document.body.style.overflow).toBe('hidden');
    rerender(
      <Modal open={false} onClose={() => {}}>
        <p>x</p>
      </Modal>,
    );
    expect(document.body.style.overflow).not.toBe('hidden');
  });
});
