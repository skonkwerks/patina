import {
  IconAlertCircle,
  IconAlertTriangle,
  IconInfoCircle,
} from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { Dialog as AriaDialog, DialogTrigger } from 'react-aria-components';

import { ButtonBase } from '../../aria/button/base.tsx';
import { Popover } from '../../aria/popover/index.ts';
import type { StatusTone } from '../../internal/statustone.ts';
import {
  stateDetailsControlStyles,
  stateDetailsDialogStyles,
  stateDetailsStyles,
} from './styles.ts';

/** The tones a state's details can carry: a failure, something to attend to, or a note. */
export type StateDetailsTone = Extract<
  StatusTone,
  'error' | 'warning' | 'info'
>;

export type StateDetailsProps = {
  /** What the control opens, such as "Details" or "Why it failed". It names the control and the popover. */
  'aria-label': string;
  /** How grave the details are, which the icon and its color say. */
  tone: StateDetailsTone;
  /** The words: why the state is what it is. */
  children: ReactNode;
  /**
   * Shows the control's name (`aria-label`) as its tooltip on hover and focus. On by default: the
   * control shows only a tone icon, which says how grave the details are but not that pressing it
   * opens them. An application that names the state beside it in words may turn it off.
   */
  hasTooltip?: boolean;
};

/** The icon a tone's control shows. */
const toneIcon = (tone: StateDetailsTone, className: string): ReactNode => {
  switch (tone) {
    case 'error':
      return <IconAlertCircle aria-hidden className={className} />;
    case 'warning':
      return <IconAlertTriangle aria-hidden className={className} />;
    case 'info':
      return <IconInfoCircle aria-hidden className={className} />;
  }
};

/**
 * What a state has to say, kept out of the line that shows the state: a small icon in the state's
 * tone that opens a popover with the words. A row shows its state as a chip and puts the reason
 * here, so a long message never widens or lengthens the row. The words open on a press, never on
 * hover alone; the popover closes on Escape or a press outside it, and focus returns to the icon.
 */
export const StateDetails = ({
  'aria-label': ariaLabel,
  tone,
  children,
  hasTooltip = true,
}: StateDetailsProps) => {
  const styles = stateDetailsStyles();
  return (
    <DialogTrigger>
      <ButtonBase
        aria-label={ariaLabel}
        tooltip={hasTooltip ? ariaLabel : undefined}
        styles={(state) =>
          stateDetailsControlStyles({
            ...state,
            variant: 'ghost',
            size: 'sm',
            statusTone: tone,
          })
        }
        pendingIndicator='replace'
        spinnerSize='sm'
      >
        {toneIcon(tone, styles.icon())}
      </ButtonBase>
      <Popover placement='bottom start' className={styles.popover()}>
        <AriaDialog
          aria-label={ariaLabel}
          className={stateDetailsDialogStyles()}
        >
          {children}
        </AriaDialog>
      </Popover>
    </DialogTrigger>
  );
};
