import type { ReactNode } from 'react';

import { iconMarkStyles } from './styles.ts';

export type IconMarkProps = {
  /** The icon, such as a Tabler icon with `aria-hidden`; the mark sizes it. */
  children: ReactNode;
  /** Required: what the mark means, as its accessible name. The mark shows no text of its own. */
  'aria-label': string;
  /** Layout only, such as a margin. */
  className?: string;
};

/**
 * A small meaningful icon inline with text, such as the mark of an item's kind in its caption line.
 * It is an image with a name, not a control, and it takes the color of the text around it.
 * Assistive technology reads its name; it shows no hover text, since words a pointer alone can
 * reach are lost to keyboard and touch. An application that wants the words visible puts them in
 * the text, or uses a focusable trigger with the shared `Tooltip`.
 */
export const IconMark = ({
  children,
  'aria-label': ariaLabel,
  className,
}: IconMarkProps) => (
  <span
    role='img'
    aria-label={ariaLabel}
    className={iconMarkStyles({ className })}
  >
    {children}
  </span>
);
