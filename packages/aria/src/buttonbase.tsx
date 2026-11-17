import type { Ref } from 'react';
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
  type ButtonRenderProps,
  composeRenderProps,
} from 'react-aria-components';

import { ButtonTooltip } from './buttontooltip.tsx';
import { EXPLAINED_DISABLED } from './explaineddisabled.ts';
import { Spinner, type SpinnerProps } from './spinner.tsx';

export type ButtonBaseProps = Omit<AriaButtonProps, 'className'> & {
  className?: string;
  /** The look, given React Aria's render state with `isDisabled` true while a reason disables it. */
  styles: (
    state: ButtonRenderProps & { className: string | undefined },
  ) => string;
  /** Where the pending spinner goes: before the label (`leading`), or in place of the icon (`replace`). */
  pendingIndicator: 'leading' | 'replace';
  spinnerSize: SpinnerProps['size'];
  /** See `ButtonProps.disabledReason`. */
  disabledReason?: string;
  /** See `ButtonProps.tooltip`. */
  tooltip?: string;
  ref?: Ref<HTMLButtonElement>;
};

/**
 * The behavior `Button` and `IconButton` share, defined once: React Aria's press semantics, a
 * disabled reason that keeps the button focusable and shows why on hover and focus, an optional
 * tooltip, and a pending spinner while presses are ignored. Each of the two gives its own look.
 */
export const ButtonBase = ({
  className,
  styles,
  pendingIndicator,
  spinnerSize,
  children,
  isPending = false,
  disabledReason,
  tooltip,
  ...rest
}: ButtonBaseProps) => {
  // A button with a reason is disabled by it.
  const reason = disabledReason || undefined;
  const explainsDisabled = reason !== undefined;
  const spinner = <Spinner size={spinnerSize} />;
  return (
    <ButtonTooltip reason={reason} label={tooltip || undefined}>
      <AriaButton
        {...rest}
        {...(explainsDisabled ? EXPLAINED_DISABLED : {})}
        isPending={isPending}
        className={composeRenderProps(className, (cls, renderProps) =>
          styles({
            ...renderProps,
            // A disabled button that explains why stays focusable, so React Aria does not report it disabled.
            isDisabled: renderProps.isDisabled || explainsDisabled,
            className: cls,
          }),
        )}
      >
        {composeRenderProps(children, (content) =>
          pendingIndicator === 'replace' ? (
            // The spinner stands in place of the icon inside the fixed square, so nothing beside it moves.
            isPending ? (
              spinner
            ) : (
              content
            )
          ) : (
            <>
              {isPending && spinner}
              {content}
            </>
          ),
        )}
      </AriaButton>
    </ButtonTooltip>
  );
};
