import { tv } from 'tailwind-variants';

/**
 * A confirmation's parts inside its dialog: the question, then the write's failure when there is
 * one, then the action row, right-aligned with Cancel first and the action last.
 */
export const confirmationStyles = tv({
  slots: {
    question: 'text-overlay-foreground text-sm leading-6',
    actions: 'flex justify-end gap-2',
  },
});
