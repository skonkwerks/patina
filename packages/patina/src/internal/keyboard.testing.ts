/*
 * For stories only; never built or shipped (`tsconfig.build.json` leaves out `*.testing.ts`).
 *
 * Tab as a browser presses it, standing in for a defect in Storybook's bundled user-event
 * (storybook 10.6.7, `dist/test/index.js`, the `Tab` key behavior), which takes the Tab destination
 * from the element the key went down on. React Aria makes a collection or a toolbar one Tab stop by
 * moving the focus during the keydown and letting the browser go on from there
 * (`useSelectableCollection` for a navigation tree or a grid, `useToolbar` for a toggle group); the
 * simulated Tab goes on from the old place instead, and so walks item by item through what is one
 * stop. Use `pressTab` wherever a story walks the Tab order into or out of such a group. It goes
 * once Storybook's bundled user-event takes the destination from the focused element, as
 * user-event 14.6.12 does.
 *
 * It approximates the browser's order: document order (Patina sets no positive `tabindex`), the
 * elements that take the focus by default or by `tabindex`, and an element with client rects
 * counted as visible, even under `visibility: hidden`.
 */

const CANDIDATES = 'a[href], button, input, select, textarea, [tabindex]';

/** The elements Tab stops at, in document order (Patina sets no positive `tabindex`). */
const tabStops = (document: Document) =>
  [...document.querySelectorAll<HTMLElement>(CANDIDATES)].filter(
    (element) =>
      element.tabIndex >= 0 &&
      !element.matches(':disabled') &&
      element.closest('[inert]') === null &&
      element.getClientRects().length > 0,
  );

/**
 * The stop after the focused element: the next stop when it is one, and otherwise (the body, or an
 * element that takes the focus without being a stop, such as a collection React Aria focused or the
 * page's heading) the first stop that follows it in the document.
 */
const stopAfter = (stops: HTMLElement[], current: Element | null) => {
  if (current === null || current === current.ownerDocument.body) {
    return stops[0];
  }
  return stops.find(
    (stop) =>
      (current.compareDocumentPosition(stop) &
        Node.DOCUMENT_POSITION_FOLLOWING) !==
      0,
  );
};

/** The stop before the focused element, by the same rule: the last stop that precedes it. */
const stopBefore = (stops: HTMLElement[], current: Element | null) => {
  if (current === null || current === current.ownerDocument.body) {
    return stops.at(-1);
  }
  return [...stops]
    .reverse()
    .find(
      (stop) =>
        stop !== current &&
        (current.compareDocumentPosition(stop) &
          Node.DOCUMENT_POSITION_PRECEDING) !==
          0,
    );
};

const keyboardEvent = (type: 'keydown' | 'keyup', isShift: boolean) =>
  new KeyboardEvent(type, {
    key: 'Tab',
    code: 'Tab',
    shiftKey: isShift,
    bubbles: true,
    cancelable: true,
  });

/**
 * Presses Tab (or Shift+Tab) in `document`: the keydown reaches the focused element and every
 * handler on its way, and unless one prevents it, the focus moves to the next (or previous) Tab
 * stop from wherever the focus is then. Past the last stop, the focus leaves the page.
 */
export const pressTab = (
  document: Document,
  { isShift = false }: { isShift?: boolean } = {},
) => {
  const from = document.activeElement ?? document.body;
  const down = keyboardEvent('keydown', isShift);
  from.dispatchEvent(down);
  if (!down.defaultPrevented) {
    const current = document.activeElement;
    const stops = tabStops(document);
    const next = isShift
      ? stopBefore(stops, current)
      : stopAfter(stops, current);
    if (next === undefined) {
      if (current instanceof HTMLElement) {
        current.blur();
      }
    } else {
      next.focus();
    }
  }
  (document.activeElement ?? document.body).dispatchEvent(
    keyboardEvent('keyup', isShift),
  );
};
