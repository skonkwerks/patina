import { Separator } from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { separatorStyles } from '../separator/index.ts';

/** The shared separator's line on the overlay a menu stands on, with a menu's spacing. */
export const menuSeparatorStyles = tv({
  extend: separatorStyles,
  base: 'my-1',
  defaultVariants: { layer: 'overlay' },
});

export const MenuSeparator = () => (
  <Separator className={menuSeparatorStyles()} />
);
