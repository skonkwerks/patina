import { tv } from 'tailwind-variants';

export const rowTileStyles = tv({
  base: 'flex h-10 w-10 shrink-0 items-center justify-center',
  variants: {
    kind: {
      // A picture runs edge to edge and is cut to the tile's rounded corners.
      picture: 'overflow-hidden rounded-md',
      // A mark stands on the row's own background, with room around it, so a mark drawn to the
      // edge of its artwork is no larger to the eye than a picture.
      mark: 'text-surface-foreground-muted p-1.5',
    },
  },
});
