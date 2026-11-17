import type { ReactNode } from 'react';

import { Tooltip, TooltipTrigger } from './tooltip.tsx';

/**
 * The one tooltip trigger around a `Button` or an `IconButton`: it shows the button's reason while
 * it has one (`disabledReason`), at once on hover and focus, and otherwise its `label` when the
 * caller gives one, such as an icon button's name, after React Aria's usual delay on hover. The
 * trigger is always rendered and only disabled while there is nothing to show, so the button is one
 * element for its whole life: a reason that comes or goes (a Save that has saved, Next on the last
 * item) never replaces the button that holds the focus or is being pressed. React Aria gives a
 * trigger's props to the nearest trigger alone, so no `TooltipTrigger` is put around either button:
 * an outer one would never open.

 */
export const ButtonTooltip = ({
  reason,
  label,
  children,
}: {
  reason: string | undefined;
  label?: string | undefined;
  children: ReactNode;
}) => {
  const text = reason ?? label;
  return (
    <TooltipTrigger
      isDisabled={text === undefined}
      delay={reason === undefined ? undefined : 0}
    >
      {children}
      {/* Only while there is something to say: React Aria closes a tooltip whose trigger is
          disabled under the pointer after its closing delay, and it would stand empty until then. */}
      {text !== undefined && <Tooltip>{text}</Tooltip>}
    </TooltipTrigger>
  );
};
