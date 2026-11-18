import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from 'motion/react';
import {
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { type Key, useLocale } from 'react-aria-components';

import { dragBounds, stripPosition, swipeIndex, turnStart } from './rules.js';
import type { CarouselItem } from './state.js';
import { carouselStyles } from './styles.js';
import type { CarouselShape, CarouselSlideState } from './types.js';

/**
 * The spring a turn and a drag that springs back move with: quick, and settling after a slight
 * overshoot (its damping ratio is about 0.7), so a turn to an end shows a sliver past it for a
 * moment, as a drag past an end gives.
 */
const SPRING = {
  type: 'spring',
  mass: 1.5,
  stiffness: 300,
  damping: 30,
} as const;

/** How much a drag past an end gives, as a fraction of the pointer's travel, before it springs back. */
const END_GIVE = 0.1;

type FrameProps<T extends CarouselItem> = {
  items: readonly T[];
  index: number;
  renderSlide: (item: T, slide: CarouselSlideState) => ReactNode;
  /** A slide's name, given the slide and its position from 1. */
  slideLabel: (item: T, position: number) => string;
  slideRoleDescription: string;
  allowsDragging: boolean;
  shape: CarouselShape | undefined;
  /** Turns to the slide at this index, which a drag landed on. */
  onTurn: (index: number) => void;
};

/**
 * A sidecar of `Carousel`, private to the carousel family: the frame and the strip of slides that
 * slides inside it. Only the current slide and its two neighbors are mounted, each the frame's
 * width, at its place along the strip; the others are not drawn at all, so a large set reads three
 * slides, not every one. The neighbors are inert, so only the current slide is in the
 * accessibility tree and the focus order. The strip stands where it shows the current slide, set
 * outside React's render: a jump the first time, when the frame's width changes, and when the
 * same slide moved to another place because one arrived or left before it, which turns nothing; a
 * spring for a change of slide, which for a turn of many places at once (the scrubber's End, an
 * awaited slide arriving) starts from the neighbor on the side the turn comes from, since the
 * slides between are not drawn; and a jump for any of it under reduced motion. A horizontal drag
 * moves the strip as far as either neighbor and no further, giving a little past an end; let go
 * past 15% of the width, it turns to the neighbor, and otherwise springs back. The browser's own
 * drag of a picture or a link inside a slide is cancelled, since it would end the strip's. A drag
 * or a swipe that starts on something in a slide that takes presses (a slide that opens its
 * picture, a link) does not press it as well: the press is cancelled as the drag starts, and the
 * click a mouse drag ends with is stopped at the strip. The frame's width is measured by a
 * `ResizeObserver`, which reports it after layout without the page being made to lay out again,
 * and the strip stays hidden until the first measure has placed it.
 */
const C = <T extends CarouselItem>({
  items,
  index,
  renderSlide,
  slideLabel,
  slideRoleDescription,
  allowsDragging,
  shape,
  onTurn,
}: FrameProps<T>) => {
  const isRightToLeft = useLocale().direction === 'rtl';
  const reduceMotion = useReducedMotion() ?? false;
  const frame = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const x = useMotionValue(0);
  const opacity = useMotionValue(0);
  // The slide the strip was last placed for, and its place, so the next placement knows whether
  // the slide changed (a spring, from the new slide's neighbor when it is many places away) or only
  // its place or the width (a jump). It records what the strip, which React does not render,
  // already shows.
  const placedFor = useRef<{ id: Key | undefined; index: number } | null>(null);
  // Whether the pointer that is down, or was last released, moved the strip: the click a browser
  // sends when that mouse is released is then the end of a drag, not a press. Motion reports the
  // drag and the browser the click, two sources React holds no state for.
  const wasDragged = useRef(false);
  const id = items[index]?.id;
  const count = items.length;
  const isDraggable = allowsDragging && width > 0 && count > 1;
  const styles = carouselStyles({ hasShape: shape !== undefined, isDraggable });

  // The frame's width, which the strip's places follow.
  useEffect(() => {
    const element = frame.current;
    if (!element) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        setWidth(entry.contentRect.width);
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Before the browser paints, so a turn, a resize, or the first measure never shows the strip
  // in its old place for a frame.
  useLayoutEffect(() => {
    if (width <= 0) {
      return;
    }
    const target = stripPosition(index, width, isRightToLeft);
    const previous = placedFor.current;
    placedFor.current = { id, index };
    opacity.set(1);
    if (previous === null || previous.id === id || reduceMotion) {
      // A jump ends whatever still moves the strip, such as a spring back from a drag.
      x.jump(target);
      return;
    }
    // A turn of many places starts from the neighbor of the slide turned to, which is drawn, rather
    // than crossing the slides between, which are not.
    const start = turnStart(previous.index, index, width, isRightToLeft);
    if (start !== undefined) {
      x.jump(start);
    }
    const controls = animate(x, target, SPRING);
    return () => controls.stop();
  }, [id, index, width, isRightToLeft, reduceMotion, x, opacity]);

  const first = Math.max(index - 1, 0);
  return (
    <div className={styles.room()}>
      <div
        ref={frame}
        className={styles.frame()}
        style={
          shape && {
            aspectRatio: `${shape.width} / ${shape.height}`,
            // The largest box of the shape the room holds, the room being the size container.
            width: `min(100cqw, 100cqh * ${shape.width} / ${shape.height})`,
          }
        }
      >
        <motion.div
          className={styles.strip()}
          style={{ x, opacity }}
          drag={isDraggable ? 'x' : false}
          dragConstraints={dragBounds(index, count, width, isRightToLeft)}
          dragElastic={END_GIVE}
          dragMomentum={false}
          // A picture or a link would otherwise start the browser's own drag, which ends this one.
          onDragStartCapture={(event) => event.preventDefault()}
          onPointerDownCapture={() => {
            wasDragged.current = false;
          }}
          onDragStart={(event) => {
            wasDragged.current = true;
            // From here the pointer moves the strip and presses nothing, as when a browser takes a
            // pointer over for a gesture of its own, which it says with `pointercancel`. React
            // Aria's press under the pointer ends on that without pressing; otherwise, after a
            // swipe, which no click follows, it would press the control itself 80ms after the
            // finger is lifted. It is sent to the document alone, where React Aria listens for it,
            // without bubbling, so it never reaches the window, where Motion's drag listens.
            // React Aria's `useLongPress` cancels a press the same way. This relies on React
            // Aria's implementation (react-aria 3.53.1, `usePress`: a `pointercancel` on the
            // document ends the press, whichever pointer it names); check it on every upgrade.
            // The `SwipeFromAControl` story fails if it changes.
            frame.current?.ownerDocument.dispatchEvent(
              new PointerEvent('pointercancel', {
                pointerId:
                  event instanceof PointerEvent ? event.pointerId : undefined,
              }),
            );
          }}
          // A mouse drag ends with the browser's click on what is under the pointer, which the
          // press, cancelled above, no longer takes, but a link would still follow; it is stopped
          // here. A click from the keyboard or assistive technology (`detail` 0) is never a
          // drag's, and is left alone.
          onClickCapture={(event) => {
            if (wasDragged.current && event.detail > 0) {
              event.stopPropagation();
              event.preventDefault();
            }
          }}
          onDragEnd={(_event, info) => {
            const next = swipeIndex(
              index,
              count,
              info.offset.x,
              width,
              isRightToLeft,
            );
            if (next !== index) {
              onTurn(next);
              return;
            }
            // Back to the slide it was on, ending the drag's own release animation.
            const target = stripPosition(index, width, isRightToLeft);
            if (reduceMotion) {
              x.jump(target);
            } else {
              void animate(x, target, SPRING);
            }
          }}
        >
          {items.slice(first, index + 2).map((item, offset) => {
            const slide = first + offset;
            return (
              <div
                key={item.id}
                role='group'
                aria-roledescription={slideRoleDescription}
                aria-label={slideLabel(item, slide + 1)}
                inert={slide !== index}
                className={styles.slide()}
                style={{ insetInlineStart: slide * width }}
              >
                {renderSlide(item, { isCurrent: slide === index })}
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

C.displayName = 'CarouselFrame';
export default C;
