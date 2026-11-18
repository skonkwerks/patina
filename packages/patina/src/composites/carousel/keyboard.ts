import type { KeyboardEvent } from 'react';
import { useLocale } from 'react-aria-components';

import { arrowStep, type KeyTarget } from './rules.ts';
import type { CarouselItem, CarouselState } from './state.ts';

/** What of the element a key press came from decides whether it keeps the arrow keys. */
const keyTarget = (target: EventTarget): KeyTarget | null =>
  target instanceof HTMLElement
    ? {
        localName: target.localName,
        type: target instanceof HTMLInputElement ? target.type : undefined,
        isContentEditable: target.isContentEditable,
      }
    : null;

/**
 * The left and right arrow keys of an element that holds a carousel, as handlers to spread on it:
 * a `Carousel` takes them on its own region, so they turn it while the focus is anywhere in it; a
 * `MediaViewer` on its own area, its caption line and details included; and a dialog that hosts
 * one, such as `MediaViewerDialog`, on the dialog's element, so they turn it from anywhere in the
 * dialog (React Aria's `Dialog` passes no keyboard handler on, so they go on the element its
 * `render` draws). A press a control already handled (React Aria's slider, radio
 * group, or toolbar stop the keys they use), one from an element that uses the arrows itself (a
 * text field, a native select, a video's own player), and one with a modifier are left alone. In a
 * right-to-left layout the left arrow goes on. The press it takes is prevented, so a host around a
 * `Carousel` that takes them too does not turn it twice.
 */
export const useCarouselKeyboard = <T extends CarouselItem>(
  state: Pick<CarouselState<T>, 'turnBy'>,
) => {
  const { direction } = useLocale();
  return {
    onKeyDown: (event: KeyboardEvent) => {
      const step = arrowStep(
        {
          key: event.key,
          defaultPrevented: event.defaultPrevented,
          altKey: event.altKey,
          ctrlKey: event.ctrlKey,
          metaKey: event.metaKey,
          shiftKey: event.shiftKey,
          target: keyTarget(event.target),
        },
        direction === 'rtl',
      );
      if (step !== undefined) {
        event.preventDefault();
        state.turnBy(step);
      }
    },
  };
};
