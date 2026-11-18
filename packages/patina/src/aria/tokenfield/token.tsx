import {
  Token as AriaToken,
  type TokenProps as AriaTokenProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { chipStyles } from '../../chip/index.js';

/**
 * A token inside the text: the chip's rounded label (`chipStyles`, its neutral tone), the one small
 * rounded label a tag also is, so a list of tags looks the same in a `TagGroup` and in a token
 * field. It stands a little apart from the text beside it, and fills with the primary color while
 * the text selection covers it, as a selected tag does; the fill overrides the chip's tone as a
 * compound variant. It draws no disabled look of its own: a disabled field fades its whole box, the
 * tokens with it.
 */
export const tokenStyles = tv({
  extend: chipStyles,
  // A line of text is 20px, so the token takes that height and none of the chip's padding.
  base: 'mx-0.5 h-5 cursor-default py-0 selection:bg-transparent',
  variants: {
    isSelected: { true: '' },
  },
  compoundVariants: [
    {
      isSelected: true,
      class: 'bg-primary text-primary-foreground border-primary',
    },
  ],
});

export type TokenProps = Omit<AriaTokenProps, 'className' | 'children'> & {
  /** The token's text, usually the segment's `text`. */
  children: string;
};

/** One token of a `TokenField`'s value, rendered by the field's `children` for each token segment. */
export const Token = (props: TokenProps) => (
  <AriaToken
    {...props}
    className={({ isSelected }) => tokenStyles({ isSelected })}
  />
);
