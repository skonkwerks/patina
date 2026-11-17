import { use } from 'react';

import { Button, type ButtonProps } from '../button/index.ts';
import { DismissDisabledContext } from './context.ts';

/**
 * The dialog's Cancel button: it closes the dialog, and it is disabled whenever the dialog may not be
 * dismissed, under the same rule as Escape and the close control.
 */
export type DialogCancelProps = Omit<ButtonProps, 'slot'>;

export const DialogCancel = (props: DialogCancelProps) => {
  const isDismissDisabled = use(DismissDisabledContext);
  return (
    <Button
      {...props}
      slot='close'
      isDisabled={isDismissDisabled || props.isDisabled}
    />
  );
};
