/**
 * The attribute that marks the page's own heading. `Header` sets it on a page's heading (its
 * `page` look, which `Page` renders), and `focusPageHeading` finds the heading by it. An attribute
 * rather than the first `h1`, so a page with another `h1` (an embedded document, a preview) still
 * sends the focus to its own heading.
 */
export const PAGE_HEADING_ATTRIBUTE = 'data-page-heading';

/**
 * Gives the focus to the page's heading, which takes the focus without being a Tab stop, so the
 * focus never falls to the document. An app calls it when its own action removes the control that
 * holds the focus, or the one the focus would return to, such as an action its own success removes:
 * call it in the write's success handler, since the heading stays and it does not matter when the
 * control leaves.
 *
 * Not from inside a modal. While a modal is open, React Aria keeps the page inert, so the heading
 * cannot take the focus: a confirmation whose write removed its opener (a row deleted through its
 * menu's confirmation) can move the focus only once the dialog has gone, and the caller gives it
 * then. The side panel does this itself for a modal opened from its content: its content closes
 * it with `isOpenerRemoved`, and the focus goes to the heading once the modal has left. The page is
 * not scrolled: the person keeps their place, and the next Tab goes on from the top of the page.
 */
export const focusPageHeading = (): void => {
  document
    .querySelector<HTMLElement>(`[${PAGE_HEADING_ATTRIBUTE}]`)
    ?.focus({ preventScroll: true });
};
