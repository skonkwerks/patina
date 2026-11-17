import { countStyles } from './styles.ts';

export type CountProps = {
  text: string;
  className?: string;
};

/**
 * A muted count after a label, such as "(3)". The caller formats the text from the vocabulary, so the
 * punctuation lives in the locale string; the caller also chooses the size relative to its label.
 */
export const Count = ({ text, className }: CountProps) => (
  <span className={countStyles({ className })}> {text}</span>
);
