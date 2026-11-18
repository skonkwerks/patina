import { IconCheck, IconMinus } from '@tabler/icons-react';

import { checkMarkStyles } from './markstyles.js';

/** The stroke of the check and the dash, heavier than an icon's default so they read at 14px. */
const CHECK_STROKE = 2.5;

type CheckMarkProps = {
  size?: 'md' | 'sm';
  isSelected: boolean;
  isIndeterminate?: boolean;
  /** The mark stands on the `neutral` fill, such as a table's header (`checkMarkStyles`). */
  isOnNeutral?: boolean;
  /** The caller's layout and focus ring, merged into the box. */
  className?: string;
};

/** The checkbox's mark (`checkMarkStyles`) drawn: its box, and its check, or a dash while indeterminate. */
export const CheckMark = ({
  size,
  isSelected,
  isIndeterminate = false,
  isOnNeutral = false,
  className,
}: CheckMarkProps) => {
  const mark = checkMarkStyles({
    size,
    isSelected,
    isIndeterminate,
    isOnNeutral,
  });
  return (
    <span className={mark.box({ className })}>
      {isIndeterminate ? (
        <IconMinus
          aria-hidden
          className={mark.check()}
          strokeWidth={CHECK_STROKE}
        />
      ) : (
        <IconCheck
          aria-hidden
          className={mark.check()}
          strokeWidth={CHECK_STROKE}
        />
      )}
    </span>
  );
};
