import type { ReactNode } from 'react';

import { imageOverlayStyles } from './styles.js';

export type ImageOverlayProps = {
  /** The icon, such as a Tabler icon with `aria-hidden`; the marker sizes it. */
  children: ReactNode;
  /**
   * What the marker means, as its accessible name. Left out, the marker is decorative and hidden
   * from assistive technology, for a meaning already said elsewhere (such as a video's own name).
   */
  'aria-label'?: string;
  /** Placement over the picture, such as `absolute top-2 right-2`. */
  className?: string;
};

/**
 * A non-interactive marker drawn over a picture, such as a mark that the item is a video. Named, it
 * is an image with a name; unnamed, it is decoration. It shows no hover text, since words a pointer
 * alone can reach are lost to keyboard and touch. A control over a picture is an `IconButton`, not
 * this.
 */
export const ImageOverlay = ({
  children,
  'aria-label': ariaLabel,
  className,
}: ImageOverlayProps) => (
  <span
    role={ariaLabel === undefined ? undefined : 'img'}
    aria-label={ariaLabel}
    aria-hidden={ariaLabel === undefined ? true : undefined}
    className={imageOverlayStyles({ className })}
  >
    {children}
  </span>
);
