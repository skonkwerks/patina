import { createContext, type ReactNode, use } from 'react';
import {
  ToggleButton as AriaToggleButton,
  ToggleButtonGroup as AriaToggleButtonGroup,
  type ToggleButtonGroupProps as AriaToggleButtonGroupProps,
  type ToggleButtonProps as AriaToggleButtonProps,
} from 'react-aria-components';
import { tv, type VariantProps } from 'tailwind-variants';

import { focusRing } from './focus.ts';

/**
 * The look of a toggle, pressed or not, on its own or as a segment of a `ToggleGroup`. The same
 * `variant` and `size` words as a button: `outline` draws a border and fills with the primary color
 * when pressed; `ghost` has no border or fill, so its icon says whether it is on. Sizes match the
 * button scale (`sm` 28px, `md` 32px, `lg` 36px).
 */
export const toggleStyles = tv({
  extend: focusRing,
  base: 'inline-flex shrink-0 cursor-pointer items-center justify-center font-medium transition-colors select-none',
  variants: {
    variant: { outline: 'border', ghost: 'border border-transparent' },
    size: {
      sm: 'h-7 px-2.5 text-xs',
      md: 'h-8 px-3 text-sm',
      lg: 'h-9 px-4 text-sm',
    },
    /** A segment shares its edges with its neighbors; a toggle on its own is rounded all round. */
    isInGroup: {
      true: '-ml-px first:ml-0 first:rounded-l-md last:rounded-r-md',
      false: 'rounded-md',
    },
    isSelected: { true: 'z-10', false: '' },
    isDisabled: { true: 'cursor-not-allowed opacity-50' },
  },
  compoundVariants: [
    {
      variant: 'outline',
      isSelected: true,
      class: 'bg-primary text-primary-foreground border-primary',
    },
    {
      variant: 'outline',
      isSelected: false,
      class:
        'text-surface-foreground border-surface-border hover:bg-surface-hover bg-transparent',
    },
    {
      variant: 'ghost',
      class: 'text-surface-foreground hover:bg-surface-hover bg-transparent',
    },
  ],
  defaultVariants: {
    variant: 'outline',
    size: 'md',
    isInGroup: false,
  },
});

/** An icon toggle's look: the toggle look as a square of the size's height, matching `IconButton`. */
export const iconToggleStyles = tv({
  extend: toggleStyles,
  compoundVariants: [
    { size: 'sm', class: 'w-7 px-0' },
    { size: 'md', class: 'w-8 px-0' },
    { size: 'lg', class: 'w-9 px-0' },
  ],
});

type ToggleStyleProps = Pick<
  VariantProps<typeof toggleStyles>,
  'variant' | 'size'
>;

/** What a group gives its toggles: that they are segments, and the group's size. */
const GroupContext = createContext<{
  isInGroup: boolean;
  size: ToggleStyleProps['size'];
}>({ isInGroup: false, size: undefined });

/** The group's frame: its toggles sit in one row and touch. */
export const toggleGroupStyles = tv({ base: 'inline-flex' });

export type ToggleGroupProps = Omit<
  AriaToggleButtonGroupProps,
  'className' | 'selectionMode'
> & {
  /** Required: the group's accessible name, what the choice is about. */
  'aria-label': string;
  /** Single by default: one pressed at a time, never none. Multiple: any number, including none. */
  selectionMode?: 'single' | 'multiple';
  /** The size of every toggle in the group. */
  size?: ToggleStyleProps['size'];
  className?: string;
};

/**
 * A segmented group of toggles: the segments touch, only the outer corners are rounded, so the group
 * reads as one control. Single-choice unless told otherwise; assistive technology hears which are pressed.
 */
export const ToggleGroup = ({
  className,
  selectionMode = 'single',
  size,
  ...rest
}: ToggleGroupProps) => (
  <GroupContext value={{ isInGroup: true, size }}>
    <AriaToggleButtonGroup
      {...rest}
      selectionMode={selectionMode}
      disallowEmptySelection={selectionMode === 'single'}
      className={toggleGroupStyles({ className })}
    />
  </GroupContext>
);

export type ToggleProps = Omit<AriaToggleButtonProps, 'className'> &
  ToggleStyleProps & {
    children: ReactNode;
  };

/** A toggle with a text label: on its own, or one segment of a `ToggleGroup` (which also sets its size). A toggle that shows only an icon is an `IconToggle`. */
export const Toggle = ({ variant, size, ...props }: ToggleProps) => {
  const group = use(GroupContext);
  return (
    <AriaToggleButton
      {...props}
      className={(renderProps) =>
        toggleStyles({
          ...renderProps,
          variant,
          size: size ?? group.size,
          isInGroup: group.isInGroup,
        })
      }
    />
  );
};

export type IconToggleProps = Omit<
  AriaToggleButtonProps,
  'className' | 'children'
> &
  ToggleStyleProps & {
    /** Required: the toggle's accessible name, since it shows only an icon. */
    'aria-label': string;
    /** The icon, given the state so it can show it (a heart that fills when on). */
    children: (state: { isSelected: boolean }) => ReactNode;
  };

/**
 * A toggle showing only an icon, with a required name. On its own it is ghost by default: no outline
 * and no fill, the icon itself shows on or off. In a `ToggleGroup` it is a square segment, such as a
 * view switcher's grid and list icons. Its sizes match `IconButton`'s, so the two sit side by side.
 */
export const IconToggle = ({ variant, size, ...props }: IconToggleProps) => {
  const group = use(GroupContext);
  return (
    <AriaToggleButton
      {...props}
      className={(renderProps) =>
        iconToggleStyles({
          ...renderProps,
          variant: variant ?? (group.isInGroup ? 'outline' : 'ghost'),
          size: size ?? group.size,
          isInGroup: group.isInGroup,
        })
      }
    />
  );
};
