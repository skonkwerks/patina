import type { ReactNode } from 'react';

import type { CarouselItem } from './state.ts';

/**
 * The shape a carousel keeps its frame in, inside the room its caller gives it, as a width and a
 * height in any unit (the size the pictures were made at, or 16 by 9): slides of that shape fill
 * the frame, and slides of another shape sit whole inside it with bars. The carousel's size and
 * its host's never follow a slide's shape.
 */
export type CarouselShape = Readonly<{ width: number; height: number }>;

/** What a slide is told as it is drawn: whether it is the one shown, or a neighbor kept ready beside it. */
export type CarouselSlideState = Readonly<{ isCurrent: boolean }>;

/**
 * The indicator under the frame, beside the position's words: a dot for each slide in a set of up
 * to nine, hidden from assistive technology, which the words already tell; past nine, a scrubber.
 */
export type CarouselIndicator<T extends CarouselItem> = Readonly<{
  /** The scrubber's accessible name, such as the vocabulary's word for the slides ("Photo"). */
  scrubberLabel: string;
  /**
   * The small picture of a slide shown over the scrubber while the pointer is over it or drags its
   * thumb, filling a square: the slide's thumbnail, drawn by the app as it draws its slides.
   */
  renderThumbnail: (item: T) => ReactNode;
}>;
