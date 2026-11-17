import { tv } from 'tailwind-variants';

import { IconButton, type IconButtonProps } from './iconbutton.tsx';
import { IconInfoCircle } from './icons.tsx';

export const infoButtonStyles = tv({
  slots: {
    root: 'text-info hover:text-primary-hover',
    icon: 'h-4 w-4',
  },
});

export type InfoButtonProps = Omit<IconButtonProps, 'children' | 'size'>;

/**
 * The info control: a small icon button carrying the info color, so it reads as "more information"
 * wherever it appears. The caller decides what pressing it does (open the help panel, a popover, ...).
 */
export const InfoButton = ({ className, ...rest }: InfoButtonProps) => {
  const styles = infoButtonStyles();
  return (
    <IconButton {...rest} size='sm' className={styles.root({ className })}>
      <IconInfoCircle aria-hidden className={styles.icon()} />
    </IconButton>
  );
};
