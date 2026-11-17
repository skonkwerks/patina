import type { StatusTone } from '../internal/statustone.ts';
import { chipStyles } from './styles.ts';

export type ChipProps = {
  /** The label: a state or a category, in words. A chip is text only (no icon or logo), and its color never stands without its words. */
  children: string;
  /** What the label means: an outcome (`success`, `warning`, `destructive`), activity (`info`), or a plain category (`neutral`, the default). */
  tone?: StatusTone;
  /** Layout only, such as a margin. */
  className?: string;
};

/**
 * The small rounded label for a state or a category, wherever one is shown: beside a row's title,
 * in a section header, or beside a field. It is not interactive, and its color always comes with
 * its words, so it reads the same without color.
 */
export const Chip = ({ children, tone, className }: ChipProps) => (
  <span className={chipStyles({ tone, className })}>{children}</span>
);
