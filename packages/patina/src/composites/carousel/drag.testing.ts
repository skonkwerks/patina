/*
 * For stories only; never built or shipped (`tsconfig.build.json` leaves out `*.testing.ts`).
 *
 * A drag as a person makes one, with the mouse or a finger, for stories of what a drag does:
 * pressed at the middle of an element, moved sideways in steps a frame apart, and released. A
 * mouse release is followed by the click a browser sends when the mouse is pressed and released on
 * the same element (the element moves with the strip, so it is still under the pointer); a swipe
 * is followed by none, as a browser sends a click only for a tap. While pressed, the pointer has
 * the pressure a real one has, so React Aria takes it for a real press, not a virtual one. Motion's
 * drag reads the pointer from the window's `pointermove` and `pointerup` and works out each step in
 * the next frame, so the moves are spread over frames for it to see them. The events are
 * dispatched, not real input, so they move no focus.
 */

/** How many frames the pointer takes to travel the distance. */
const STEPS = 8;

/** Long enough for what a press does after the release (React Aria's own click waits 80ms). */
export const AFTER_RELEASE_MS = 200;

const nextFrame = (window: Window) =>
  new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });

type PointerKind = 'mouse' | 'touch';

const pointerEvent = (
  type: 'pointerdown' | 'pointermove' | 'pointerup',
  pointerType: PointerKind,
  clientX: number,
  clientY: number,
) => {
  const isPressed = type !== 'pointerup';
  // A finger has a size; a mouse is a point.
  const size = pointerType === 'touch' ? 20 : 1;
  return new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    composed: true,
    pointerId: pointerType === 'touch' ? 2 : 1,
    pointerType,
    isPrimary: true,
    button: 0,
    buttons: isPressed ? 1 : 0,
    pressure: isPressed ? 0.5 : 0,
    width: size,
    height: size,
    clientX,
    clientY,
  });
};

/**
 * Presses at the middle of `element` with the mouse (or, with `pointerType: 'touch'`, a finger)
 * and moves `distance` CSS pixels sideways (negative to the left), and gives back the release: the
 * pointer is still down when it returns, so a story can look at what the drag did before letting
 * go.
 */
export const dragSideways = async (
  element: HTMLElement,
  distance: number,
  { pointerType = 'mouse' }: { pointerType?: PointerKind } = {},
): Promise<() => Promise<void>> => {
  const window = element.ownerDocument.defaultView;
  if (window === null) {
    throw new Error('The element is not in a window.');
  }
  const box = element.getBoundingClientRect();
  const startX = box.left + box.width / 2;
  const y = box.top + box.height / 2;
  element.dispatchEvent(pointerEvent('pointerdown', pointerType, startX, y));
  for (let step = 1; step <= STEPS; step += 1) {
    await nextFrame(window);
    element.dispatchEvent(
      pointerEvent(
        'pointermove',
        pointerType,
        startX + (distance * step) / STEPS,
        y,
      ),
    );
  }
  await nextFrame(window);
  return async () => {
    const endX = startX + distance;
    element.dispatchEvent(pointerEvent('pointerup', pointerType, endX, y));
    if (pointerType === 'mouse') {
      element.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          composed: true,
          button: 0,
          detail: 1,
          clientX: endX,
          clientY: y,
        }),
      );
    }
    await nextFrame(window);
  };
};
