/**
 * What a button that cannot be pressed for a reason it says (`disabledReason` on `Button` and
 * `IconButton`) is given over its own props: it stays focusable, so its reason can be read on hover
 * and focus (`ButtonTooltip`) and a press that brings it to this state does not take the focus
 * away; it is reported disabled to assistive technology; and its press and click do nothing. A
 * React Aria trigger around it (a menu's, a dialog's, a file picker's) would still open on a press,
 * so such a button stands outside any trigger. Its styles are told that it is disabled.
 *
 * It sets no `data-disabled`: the button styles are given the reason itself, and no style of a
 * button reads the attribute.
 */
export const EXPLAINED_DISABLED = {
  isDisabled: false,
  'aria-disabled': true,
  type: 'button',
  onPress: undefined,
  onPressStart: undefined,
  onPressEnd: undefined,
  onPressUp: undefined,
  onPressChange: undefined,
  onClick: undefined,
} as const;
