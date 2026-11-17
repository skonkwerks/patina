import { Separator } from 'react-aria-components';
import { tv } from 'tailwind-variants';

export const menuSeparatorStyles = tv({ base: 'bg-overlay-border my-1 h-px' });

export const MenuSeparator = () => (
  <Separator className={menuSeparatorStyles()} />
);
