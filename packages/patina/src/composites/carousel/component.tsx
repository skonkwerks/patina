import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { type ReactNode, useEffect, useLayoutEffect, useRef } from 'react';

import { IconButton } from '../../aria/iconbutton/index.js';
import Frame from './frame.js';
import { useCarouselKeyboard } from './keyboard.js';
import Position from './position.js';
import { indicatorKind } from './rules.js';
import type { CarouselItem, CarouselState } from './state.js';
import { carouselStyles } from './styles.js';
import type {
  CarouselIndicator,
  CarouselShape,
  CarouselSlideState,
} from './types.js';

/**
 * A carousel's accessible name, which every carousel has, without the word for a carousel: the
 * visible label it stands under (`aria-labelledby`, its id), such as the heading of its section,
 * or, without one, the name itself (`aria-label`, such as "Photos of the house").
 */
export type CarouselName =
  | { 'aria-label': string; 'aria-labelledby'?: undefined }
  | { 'aria-label'?: undefined; 'aria-labelledby': string };

/** Everything a `Carousel` takes but its name. */
export type CarouselBaseProps<T extends CarouselItem> = {
  /** Where the carousel is, held by the component that shows it (`useCarouselState`). */
  state: CarouselState<T>;
  /** The vocabulary's word for a carousel, which assistive technology says after its name. */
  'aria-roledescription': string;
  /**
   * `region` (the default), a landmark of the page; `group` where the carousel is the content of
   * something that is already named, such as a dialog, or where a page holds many of them.
   */
  role?: 'region' | 'group';
  /**
   * Draws a slide, filling the frame: a picture whole inside it (`object-contain`), or anything
   * else. Only the current slide and its two neighbors are drawn, so a large set reads three, not
   * every one; `isCurrent` says which is shown, so a video can play on the current slide alone.
   */
  renderSlide: (item: T, slide: CarouselSlideState) => ReactNode;
  /** The vocabulary's word for a slide, which assistive technology says after a slide's name. */
  slideRoleDescription: string;
  /** A slide's name, such as its picture's title; its position in words (`positionText`) when absent. */
  slideLabel?: (item: T) => string;
  /**
   * Where the carousel is, in words, from the slide's position (from 1) and the set's count: "3 of
   * 12". The position line says it, and the scrubber gives it as its value.
   */
  positionText: (position: number, count: number) => string;
  /** The accessible name of Previous, such as the vocabulary's word for it. */
  previousLabel: string;
  /** The accessible name of Next. */
  nextLabel: string;
  /** Why Previous cannot be pressed on the first slide, such as "This is the first photo". */
  previousDisabledReason: string;
  /** Why Next cannot be pressed on the last slide. */
  nextDisabledReason: string;
  /**
   * Whether a horizontal drag or swipe turns the carousel (the default). Set it to `false` for a
   * set in which a drag across a slide is the slide's own, such as one with a video, whose player
   * seeks by dragging: Previous, Next, and the arrow keys still turn it.
   */
  allowsDragging?: boolean;
  /**
   * The frame's shape inside the carousel's room, such as the size the pictures were made at: the
   * frame is then the largest box of that shape the room holds; without it, the frame is the whole
   * room. It never changes the carousel's size, which is its caller's, nor follows a slide: a slide
   * of another shape sits whole inside the frame, with bars.
   */
  shape?: CarouselShape;
  /** The dots or the scrubber under the frame, beside the position's words; none when absent. */
  indicator?: CarouselIndicator<T>;
  /**
   * Layout and size: the carousel fills the height it is given (20rem unless the caller gives
   * another, such as `h-96`, or `h-auto flex-1` in a column that has a height), and its frame
   * takes what Previous, Next, and the line under it leave.
   */
  className?: string;
};

export type CarouselProps<T extends CarouselItem> = CarouselBaseProps<T> &
  CarouselName;

/**
 * A set of slides shown one at a time, the same inline on a page and in a dialog: the WAI-ARIA
 * carousel (a region or a group named by the app, by a visible label or by a name of its own, with
 * its role description; each slide a group with its own role description and name), with Previous
 * and Next beside the frame and the position under it. Nothing turns on its own. It turns by
 * Previous and Next, by the left and right arrow keys while the focus is anywhere in it (not when a
 * control there uses them, such as a video's player or the scrubber), by a horizontal drag or swipe
 * past 15% of its width, which springs back short of that, and by the app through its state
 * (`turnTo`). It stops at the ends: on
 * the first slide Previous, and on the last Next, cannot be pressed, says why, and stays
 * focusable, so the press that reaches an end keeps the focus; a set of one has both, so the frame
 * keeps its place when the set grows. When the set changes under it, it stays on the slide it
 * shows (`useCarouselState`). Its slides are the app's, drawn by `renderSlide`; it keeps one frame
 * for all of them, so Previous and Next never move. The focus never falls to the page: when what
 * holds it goes away (a slide that turns out of view or leaves the set, the scrubber when the set
 * shrinks to nine or fewer, Previous and Next when the set empties), the carousel itself takes it,
 * and then shows the focus ring. Motion that carries nothing (the slide's slide, the spring back)
 * is left out under reduced motion. An empty set shows an empty frame, with Previous and Next
 * disabled and no position.
 */
export const Carousel = <T extends CarouselItem>({
  state,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  'aria-roledescription': roleDescription,
  role = 'region',
  renderSlide,
  slideRoleDescription,
  slideLabel,
  positionText,
  previousLabel,
  nextLabel,
  previousDisabledReason,
  nextDisabledReason,
  allowsDragging = true,
  shape,
  indicator,
  className,
}: CarouselProps<T>) => {
  const region = useRef<HTMLDivElement>(null);
  // Whether the focus is in the carousel, or left it for nowhere while the person stayed. A control
  // the carousel removes or disables takes the focus with it, and the browser says so late, as a
  // blur toward nothing, or not at all; focus events are the only record of where the focus was,
  // and React keeps none. A press anywhere else on the page is the person leaving.
  const holdsFocus = useRef(false);
  const { items, index, current } = state;
  const count = items.length;
  const kind = indicator === undefined ? 'none' : indicatorKind(count);
  const isEmpty = count === 0;
  const keyboard = useCarouselKeyboard(state);
  const styles = carouselStyles();

  // A press outside the carousel moves the focus there, or to nothing when what is pressed takes
  // none (the page's background): either way the person has left, and the carousel no longer keeps
  // a focus it lost. A subscription to the document, which React does not render.
  useEffect(() => {
    const page = region.current?.ownerDocument;
    if (page === undefined) {
      return;
    }
    const onPointerDown = (event: PointerEvent) => {
      if (
        !(event.target instanceof Node) ||
        !region.current?.contains(event.target)
      ) {
        holdsFocus.current = false;
      }
    };
    page.addEventListener('pointerdown', onPointerDown, true);
    return () => page.removeEventListener('pointerdown', onPointerDown, true);
  }, []);

  // After a change that can take away what holds the focus (the slide shown, the scrubber, or
  // Previous and Next as the set empties), and before the browser moves a lost focus to the page:
  // the carousel takes it, where it stands, without scrolling the page. A slide out of view is
  // inert, and the focus left inside one is lost too.
  useLayoutEffect(() => {
    const element = region.current;
    if (element === null || !holdsFocus.current) {
      return;
    }
    const page = element.ownerDocument;
    const active = page.activeElement;
    const isLost =
      active === null ||
      active === page.body ||
      (element.contains(active) && active.closest('[inert]') !== null);
    if (isLost) {
      element.focus({ preventScroll: true });
    }
  }, [current?.id, isEmpty, kind]);

  const turnTo = (next: number) => {
    const item = items[next];
    if (item !== undefined) {
      state.turnTo(item.id);
    }
  };

  return (
    <div
      ref={region}
      role={role}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      aria-roledescription={roleDescription}
      // Not a Tab stop: it takes the focus when what held it goes away, or from a press on the frame.
      tabIndex={-1}
      className={styles.root({ className })}
      onFocus={() => {
        holdsFocus.current = true;
      }}
      onBlur={(event) => {
        // A blur toward nothing may be the loss the effect above makes good, so it is kept.
        if (
          event.relatedTarget !== null &&
          !event.currentTarget.contains(event.relatedTarget)
        ) {
          holdsFocus.current = false;
        }
      }}
      {...keyboard}
    >
      <div className={styles.row()}>
        <IconButton
          aria-label={previousLabel}
          isDisabled={isEmpty}
          disabledReason={
            !isEmpty && index === 0 ? previousDisabledReason : undefined
          }
          onPress={() => state.turnBy(-1)}
        >
          <IconChevronLeft aria-hidden className={styles.buttonIcon()} />
        </IconButton>
        <Frame
          items={items}
          index={index}
          renderSlide={renderSlide}
          slideLabel={(item, position) =>
            slideLabel?.(item) ?? positionText(position, count)
          }
          slideRoleDescription={slideRoleDescription}
          allowsDragging={allowsDragging}
          shape={shape}
          onTurn={turnTo}
        />
        <IconButton
          aria-label={nextLabel}
          isDisabled={isEmpty}
          disabledReason={
            !isEmpty && index === count - 1 ? nextDisabledReason : undefined
          }
          onPress={() => state.turnBy(1)}
        >
          <IconChevronRight aria-hidden className={styles.buttonIcon()} />
        </IconButton>
      </div>
      <Position
        items={items}
        index={index}
        kind={kind}
        positionText={positionText}
        indicator={indicator}
        onTurn={turnTo}
      />
    </div>
  );
};
