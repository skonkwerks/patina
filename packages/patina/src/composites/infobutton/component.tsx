import { IconInfoCircle } from '@tabler/icons-react';

import {
  IconButton,
  type IconButtonProps,
} from '../../aria/iconbutton/index.ts';
import { infoButtonStyles } from './styles.ts';

export type InfoButtonProps = Omit<IconButtonProps, 'children' | 'size'>;

/**
 * The info control: a small icon button with the info icon, in the ghost neutral look every icon
 * control has, so it reads as "more information" by its icon, not by a status color (a status tone
 * says how a thing stands, never what a control does). The caller decides what pressing it does
 * (open the help panel, a popover, ...).
 */
export const InfoButton = (props: InfoButtonProps) => {
  const styles = infoButtonStyles();
  return (
    <IconButton {...props} size='sm'>
      <IconInfoCircle aria-hidden className={styles.icon()} />
    </IconButton>
  );
};
