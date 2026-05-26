'use client';

import { useEffect, useRef } from 'react';

/**
 * Accessible modal shell.
 *
 * Provides:
 *  - role="dialog" + aria-modal + aria-labelledby
 *  - Focus trap (Tab/Shift+Tab stays inside the modal)
 *  - ESC closes
 *  - Returns focus to the element that triggered the modal on close
 *  - Scroll lock on <body> while open
 *  - Click-on-backdrop close (configurable)
 *
 * Existing modal components can wrap their contents in this — keeps their
 * markup but inherits a11y for free.
 */
const FOCUSABLE_SEL = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Used as aria-labelledby target. Render an element with this id inside. */
  labelledBy?: string;
  /** Optional label fallback if labelledBy isn't set. */
  ariaLabel?: string;
  /** Close on backdrop click (default true). */
  dismissOnBackdrop?: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function Modal({
  open,
  onClose,
  labelledBy,
  ariaLabel,
  dismissOnBackdrop = true,
  children,
  className = '',
}: ModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);

  // Lock scroll + remember the element that had focus before open.
  useEffect(() => {
    if (!open) return;
    previousActiveRef.current = document.activeElement as HTMLElement | null;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Move focus inside the modal on next paint so the trap has a target.
    const id = requestAnimationFrame(() => {
      const focusable = containerRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SEL);
      const first = focusable && focusable.length > 0 ? focusable[0] : containerRef.current;
      first?.focus();
    });

    return () => {
      cancelAnimationFrame(id);
      document.body.style.overflow = original;
      // Return focus to triggering element so screen readers re-announce.
      previousActiveRef.current?.focus?.();
    };
  }, [open]);

  // ESC + focus trap.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusable = containerRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SEL);
      if (!focusable || focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (active === first || !containerRef.current?.contains(active)) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (active === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => {
        if (!dismissOnBackdrop) return;
        // Only close when the mousedown started on the backdrop itself.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-label={labelledBy ? undefined : ariaLabel}
        tabIndex={-1}
        className={className}
      >
        {children}
      </div>
    </div>
  );
}
