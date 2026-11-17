import type { Ref } from 'react';
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
  type ButtonRenderProps,
  composeRenderProps,
} from 'react-aria-components';

import { ButtonTooltip } from './buttontooltip.tsx';
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
        // A button disabled by its reason stays focusable, so its reason can be read on hover and
        // focus and a press that brings it to this state keeps the focus; it is reported disabled to
        // assistive technology, and its press and click do nothing. A React Aria trigger around it
        // (a menu's, a dialog's, a file picker's) would still open on a press, so such a button
        // stands outside any trigger. Its styles are told that it is disabled.
        isDisabled={explainsDisabled ? false : rest.isDisabled}
        aria-disabled={explainsDisabled ? true : rest['aria-disabled']}
        type={explainsDisabled ? 'button' : rest.type}
        onPress={explainsDisabled ? undefined : rest.onPress}
        onPressStart={explainsDisabled ? undefined : rest.onPressStart}
        onPressEnd={explainsDisabled ? undefined : rest.onPressEnd}
        onPressUp={explainsDisabled ? undefined : rest.onPressUp}
        onPressChange={explainsDisabled ? undefined : rest.onPressChange}
        onClick={explainsDisabled ? undefined : rest.onClick}
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
