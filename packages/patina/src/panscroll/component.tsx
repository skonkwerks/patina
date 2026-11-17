import {
  animate,
  type AnimationPlaybackControls,
  motion,
  useReducedMotion,
} from 'motion/react';
import { type ReactNode, type RefObject, useEffect, useRef } from 'react';

import { scrollGlide } from './glide.ts';
import { PAN_MOVING, PAN_OVERSCROLL } from './pan.ts';
import { panScrollStyles } from './styles.ts';

/** How far a glide carries, in seconds of the release speed; unhindered, it lasts twice that. */
const GLIDE_REACH_S = 0.8;

/**
 * The spring that brings the items back after a glide runs past an end: underdamped, so they
 * overshoot a little on the way back and settle.
 */
const REBOUND = { type: 'spring', stiffness: 200, damping: 22 } as const;

export type PanScrollProps = {
  /**
   * The element whose horizontal scroll position the mouse drags, such as a `MediaStrip`'s grid. A
   * collection there selects on press up (`shouldSelectOnPressUp`, as `MediaStrip` does), so the
   * pointer down that starts a pan never selects; its classes include `panScrollTargetStyles`.
   */
  target: RefObject<HTMLElement | null>;
  /** What the drag starts on: the scroller, or anything around it. */
  children: ReactNode;
  /** Layout only. */
  className?: string;
};

/**
 * Lets the mouse scroll `target` sideways by dragging anywhere in `children`, as touch and a
 * trackpad already scroll it, such as a `MediaStrip` laid out horizontally. The pan starts only
 * past a few pixels, so a click stays a click; the target selects on press up, which a pan never
 * reaches, so a drag never changes the selection. The browser's own drag of an image or a link is
 * cancelled here, and text here is not selected by a drag, since a mouse drag here is a pan. Let go
 * while moving and the scroll glides on, slowing evenly to a stop, left to right or right to left
 * (`scrollGlide`); a glide that reaches an end while still
 * moving carries the items past it and springs them back, through `PAN_OVERSCROLL` on the target,
 * which the target applies to its items as a horizontal shift. With reduced motion a release stops
 * where it is. While anything moves the target carries `PAN_MOVING`, so its items ignore the
 * pointer passing over them. A press, a key, or the wheel stops a glide or a rebound, so a click
 * never lands on a moving item and the keyboard's scrolling to the focused item is never
 * overwritten. Only the mouse pans: touch and a trackpad already scroll natively. Not for a
 * collection whose items can be dragged, where dragging an item moves it: a reorderable
 * `MediaStrip` uses its tiles' drag handles instead.
 */
export const PanScroll = ({ target, children, className }: PanScrollProps) => {
  const reduceMotion = useReducedMotion();
  const motionRef = useRef<AnimationPlaybackControls | null>(null);
  // Where the drag started: the scroll position plus the pointer's offset then. Each move sets the
  // position from it, so the rounding of each write to device pixels never accumulates.
  const anchor = useRef(0);
  const settle = (element: HTMLElement) => {
    element.style.removeProperty(PAN_OVERSCROLL);
    element.removeAttribute(PAN_MOVING);
  };
  const stop = () => {
    motionRef.current?.stop();
    motionRef.current = null;
    if (target.current) {
      settle(target.current);
    }
  };
  // A glide still running when the scroller goes away is stopped with it.
  useEffect(() => () => motionRef.current?.stop(), []);

  /** Springs the items back from past an end they reached at `velocity` (pixels per second of `scrollLeft`). */
  const rebound = (element: HTMLElement, velocity: number) => {
    motionRef.current = animate(0, 0, {
      ...REBOUND,
      velocity,
      // The items shift against the scroll: a scroll that was moving right shifts them left.
      onUpdate: (offset) =>
        element.style.setProperty(PAN_OVERSCROLL, `${-offset}px`),
      onComplete: () => settle(element),
    });
  };

  return (
    <motion.div
      className={panScrollStyles({ className })}
      onPointerDownCapture={stop}
      onWheel={stop}
      onKeyDownCapture={stop}
      // A picture or a link would otherwise start the browser's own drag, which cancels the pan.
      onDragStartCapture={(event) => event.preventDefault()}
      onPanStart={(event, info) => {
        const element = target.current;
        if (event.pointerType !== 'mouse' || !element) {
          return;
        }
        anchor.current = element.scrollLeft + info.offset.x;
        element.setAttribute(PAN_MOVING, '');
      }}
      onPan={(event, info) => {
        if (event.pointerType === 'mouse') {
          target.current?.scrollTo({ left: anchor.current - info.offset.x });
        }
      }}
      onPanEnd={(event, info) => {
        const element = target.current;
        if (event.pointerType !== 'mouse' || !element) {
          return;
        }
        const glide = reduceMotion
          ? undefined
          : scrollGlide({
              scrollLeft: element.scrollLeft,
              maxScroll: element.scrollWidth - element.clientWidth,
              velocity: -info.velocity.x,
              isRightToLeft: getComputedStyle(element).direction === 'rtl',
              reach: GLIDE_REACH_S,
              resolution: 1 / window.devicePixelRatio,
            });
        if (!glide) {
          settle(element);
          return;
        }
        const done = () => {
          if (glide.arrival === 0) {
            settle(element);
          } else {
            rebound(element, glide.arrival);
          }
        };
        if (glide.duration === 0) {
          done();
          return;
        }
        motionRef.current = animate(0, glide.duration, {
          duration: glide.duration,
          ease: 'linear',
          onUpdate: (t) => element.scrollTo({ left: glide.at(t) }),
          onComplete: done,
        });
      }}
    >
      {children}
    </motion.div>
  );
};
