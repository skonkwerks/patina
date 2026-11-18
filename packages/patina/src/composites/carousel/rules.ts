import type { Key } from 'react-aria-components';

/*
 * The rules of a carousel that shows one slide of a set at a time, kept pure so they are tested:
 * where it is while the set changes under it, where a turn lands, which slide a drag lands on,
 * which key presses turn it, where its strip of slides stands and how far it may be dragged, and
 * which slide a pointer over its scrubber names. Nothing turns past an end.
 */

/** How far a drag must carry the slide, as a fraction of the frame's width, to turn to its neighbor. */
export const SWIPE_FRACTION = 0.15;

/** Up to this many slides, the indicator is a dot for each; past it, a scrubber. */
export const MAX_DOTS = 9;

/** Which indicator a carousel shows under its frame. */
export type IndicatorKind = 'none' | 'dots' | 'scrubber';

/**
 * The indicator a set of `count` slides has, when the carousel has one: none for fewer than two
 * slides, a dot for each up to nine, a scrubber past nine.
 */
export const indicatorKind = (count: number): IndicatorKind => {
  if (count <= 1) {
    return 'none';
  }
  return count <= MAX_DOTS ? 'dots' : 'scrubber';
};

/**
 * Where a carousel is: the slide it shows, by identity, and the place that slide had. The place is
 * what is left when the slide itself leaves the set. Before the slide it opens on has been in the
 * set, the place names that slide and is awaited (`isAwaited`): the carousel shows the slide at
 * its place, the first, meanwhile, and goes to the awaited slide when it arrives.
 */
export type Place = Readonly<{
  id: Key | undefined;
  index: number;
  isAwaited: boolean;
}>;

/** An index inside a set of `count` slides; 0 for an empty set. */
export const clampIndex = (index: number, count: number): number =>
  count === 0 ? 0 : Math.min(Math.max(index, 0), count - 1);

/** The place of the slide at `index`, kept inside the set: one the carousel is on, not awaited. */
export const placeAt = (ids: readonly Key[], index: number): Place => {
  const clamped = clampIndex(index, ids.length);
  return { id: ids[clamped], index: clamped, isAwaited: false };
};

/**
 * Where a carousel opens: on the slide with `id`, or on the first when it names none. A slide the
 * set does not hold yet, such as one in a page still being read, is awaited: the carousel opens on
 * the first slide, and goes to that one when it arrives, unless the person has turned it meanwhile.
 */
export const openingPlace = (
  ids: readonly Key[],
  id: Key | undefined,
): Place => {
  if (id === undefined) {
    return placeAt(ids, 0);
  }
  const index = ids.indexOf(id);
  return index >= 0
    ? { id, index, isAwaited: false }
    : { id, index: 0, isAwaited: true };
};

/**
 * Where the current slide is in a set that can change under the carousel: the place of the slide
 * it is on, by identity, so a slide arriving or leaving before it does not turn the page; or, when
 * that slide is gone or has not arrived yet, the place it had, kept inside the set.
 */
export const currentIndex = (ids: readonly Key[], place: Place): number => {
  const found = place.id === undefined ? -1 : ids.indexOf(place.id);
  return found >= 0 ? found : clampIndex(place.index, ids.length);
};

/**
 * The place after the set changed under the carousel, or the same place when nothing is to change:
 * the place of its slide where it stands now; an awaited slide that has arrived, which is no
 * longer awaited; an awaited slide still to come, kept; or, when the slide it was on has left, the
 * slide now at its place, which the carousel follows from there. An empty set changes nothing.
 */
export const followedPlace = (ids: readonly Key[], place: Place): Place => {
  const found = place.id === undefined ? -1 : ids.indexOf(place.id);
  if (found >= 0) {
    return found === place.index && !place.isAwaited
      ? place
      : { id: place.id, index: found, isAwaited: false };
  }
  if (place.isAwaited || ids.length === 0) {
    return place;
  }
  return placeAt(ids, place.index);
};

/**
 * The place `step` slides on from where the carousel is, which the person chose, so a slide that
 * was awaited no longer is; the same place when the step goes nowhere (at an end).
 */
export const turnedPlace = (
  ids: readonly Key[],
  place: Place,
  step: number,
): Place => {
  const index = currentIndex(ids, place);
  const next = clampIndex(index + step, ids.length);
  return next === index ? place : placeAt(ids, next);
};

/**
 * The slide a horizontal drag of `offset` pixels lands on: the previous one for a drag toward the
 * reading end past the threshold (to the right, left to right), the next one for a drag the other
 * way, else the same one; never past an end, and the same one before the width is known.
 */
export const swipeIndex = (
  index: number,
  count: number,
  offset: number,
  width: number,
  isRightToLeft: boolean,
): number => {
  if (width <= 0 || Math.abs(offset) <= width * SWIPE_FRACTION) {
    return index;
  }
  const towardStart = isRightToLeft ? offset < 0 : offset > 0;
  return clampIndex(towardStart ? index - 1 : index + 1, count);
};

/** What of the focused element decides whether it keeps the arrow keys for itself. */
export type KeyTarget = Readonly<{
  localName: string;
  /** An `input`'s type; none for any other element. */
  type: string | undefined;
  isContentEditable: boolean;
}>;

/** Input types whose control has no use for the left and right arrow keys. */
const INPUTS_WITHOUT_ARROWS = new Set([
  'button',
  'checkbox',
  'color',
  'file',
  'hidden',
  'image',
  'reset',
  'submit',
]);

/**
 * Whether the focused element uses the left and right arrow keys itself: a text field's caret, a
 * native select or range, radio buttons, editable text, and a video's or an audio's own player,
 * which seeks with them. React Aria's controls that use them (a slider, a radio group, a toolbar)
 * stop the key where they handle it, so it never reaches the carousel.
 */
export const usesArrowKeys = (target: KeyTarget): boolean => {
  if (target.isContentEditable) {
    return true;
  }
  if (target.localName === 'input') {
    return !INPUTS_WITHOUT_ARROWS.has(target.type ?? 'text');
  }
  return ['textarea', 'select', 'video', 'audio'].includes(target.localName);
};

/** What of a key press decides whether the carousel takes it. */
export type ArrowPress = Readonly<{
  key: string;
  defaultPrevented: boolean;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  /** The element the press came from; none when it is not an element. */
  target: KeyTarget | null;
}>;

/**
 * The step a left or right arrow press asks for, in the reading direction (right to left, the left
 * arrow goes on), or none. A press a control already handled, or one from an element that uses the
 * arrow keys itself, is left to it, and a press with a modifier keeps the browser's own shortcut.
 */
export const arrowStep = (
  press: ArrowPress,
  isRightToLeft: boolean,
): -1 | 1 | undefined => {
  if (
    press.defaultPrevented ||
    press.altKey ||
    press.ctrlKey ||
    press.metaKey ||
    press.shiftKey ||
    (press.target !== null && usesArrowKeys(press.target))
  ) {
    return undefined;
  }
  if (press.key === 'ArrowLeft') {
    return isRightToLeft ? 1 : -1;
  }
  if (press.key === 'ArrowRight') {
    return isRightToLeft ? -1 : 1;
  }
  return undefined;
};

/**
 * Where the strip of slides stands, in pixels along x, to show the slide at `index` in a frame
 * `width` pixels wide. The slides run from the reading start, so the strip moves the other way: to
 * the left in a left-to-right layout, to the right in a right-to-left one.
 */
export const stripPosition = (
  index: number,
  width: number,
  isRightToLeft: boolean,
): number => {
  const distance = index * width;
  return isRightToLeft || distance === 0 ? distance : -distance;
};

/**
 * Where the strip starts a turn from the slide at `from` to the slide at `to`, when it does not
 * start where it stands: for a turn of more than one place, at the slide just before `to` on the
 * side the turn comes from, so the last width slides in as on a single turn. Only the slide turned
 * to and its neighbors are drawn, so a strip that set out from where it stood would show the bare
 * canvas, then a slide it was not turned to, for most of the way. None for a turn of one place or
 * none, which starts where the strip stands.
 */
export const turnStart = (
  from: number,
  to: number,
  width: number,
  isRightToLeft: boolean,
): number | undefined => {
  const distance = to - from;
  return Math.abs(distance) > 1
    ? stripPosition(to - Math.sign(distance), width, isRightToLeft)
    : undefined;
};

/**
 * How far the strip may be dragged while it shows the slide at `index`: as far as either neighbor
 * and no further, since only the neighbors are mounted, and not past an end of the set.
 */
export const dragBounds = (
  index: number,
  count: number,
  width: number,
  isRightToLeft: boolean,
): Readonly<{ left: number; right: number }> => {
  const previous = stripPosition(
    clampIndex(index - 1, count),
    width,
    isRightToLeft,
  );
  const next = stripPosition(
    clampIndex(index + 1, count),
    width,
    isRightToLeft,
  );
  return { left: Math.min(previous, next), right: Math.max(previous, next) };
};

/**
 * The slide (its position, from 1) a pointer at `pointerX` over a scrubber's track names, as the
 * slider would take it: the track's start is the first slide and its end the last, from the right
 * in a right-to-left layout. None while the track has no width or the set no slides.
 */
export const scrubberPosition = (
  pointerX: number,
  track: Readonly<{ left: number; width: number }>,
  count: number,
  isRightToLeft: boolean,
): number | undefined => {
  if (track.width <= 0 || count === 0) {
    return undefined;
  }
  const along = Math.min(Math.max((pointerX - track.left) / track.width, 0), 1);
  return 1 + Math.round((isRightToLeft ? 1 - along : along) * (count - 1));
};

/** How far along the track a slide's position stands, from 0 at the first to 1 at the last. */
export const scrubberFraction = (position: number, count: number): number =>
  count <= 1 ? 0 : (position - 1) / (count - 1);
