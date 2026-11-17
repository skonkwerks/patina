/*
 * The contract between `PanScroll` and the scroller it drives, such as a `MediaStrip` laid out as
 * one row. A scroll position cannot pass an end, so a glide that reaches one while still moving
 * shifts the scroller's items instead, and springs them back.
 */

/**
 * The CSS custom property `PanScroll` sets on the scroller while its items rebound past an end: a
 * length the scroller applies to its items as a horizontal shift. Unset, the items are not
 * shifted. `panScrollTargetStyles` names it, as Tailwind needs a literal.
 */
export const PAN_OVERSCROLL = '--pan-overscroll';

/**
 * The attribute `PanScroll` sets on the scroller while it drags, glides, or rebounds. The scroller
 * makes its items ignore the pointer then, so items passing under a still pointer do not churn
 * their hover state, and keeps them ready to move (`will-change`). `panScrollTargetStyles` names
 * it, as Tailwind needs a literal.
 */
export const PAN_MOVING = 'data-panning';
