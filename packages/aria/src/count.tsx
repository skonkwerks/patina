import { tv } from 'tailwind-variants';

export const countStyles = tv({
  base: 'text-canvas-foreground-muted font-normal',
});

/**
 * A muted count after a label, such as "(3)". The caller formats the text from the vocabulary, so the
 * punctuation lives in the locale string; the caller also chooses the size relative to its label.
 */
export const Count = ({
  text,
  className,
}: {
  text: string;
  className?: string;
}) => <span className={countStyles({ className })}> {text}</span>;
