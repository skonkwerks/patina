import { tv } from 'tailwind-variants';

/**
 * A small icon at the height of a line of small text, in the color of the text around it (it
 * follows its layer, inside a dialog or a row alike); the icon is sized by the mark.
 */
export const iconMarkStyles = tv({
  base: 'inline-flex shrink-0 text-current [&>svg]:size-4',
});
