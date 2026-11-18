import { countStyles } from './styles.js';

export type CountProps = {
  text: string;
  className?: string;
};

/**
 * A count after a label, such as "(3)", in the color of where it stands (see `countStyles`). The caller formats the text from the vocabulary, so the
 * punctuation lives in the locale string; the caller also chooses the size relative to its label.
 */
export const Count = ({ text, className }: CountProps) => (
  <span className={countStyles({ className })}> {text}</span>
);
