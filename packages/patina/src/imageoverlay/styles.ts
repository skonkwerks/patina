import { tv } from 'tailwind-variants';

/**
 * A round marker on a translucent surface circle, so it reads on any picture; the icon is sized by
 * the marker. The caller positions it over the picture.
 */
export const imageOverlayStyles = tv({
  base: 'bg-surface/90 text-surface-foreground inline-flex size-6 shrink-0 items-center justify-center rounded-full [&>svg]:size-4',
});
