import { useState } from 'react';
import type { Key } from 'react-aria-components';

import {
  currentIndex,
  followedPlace,
  openingPlace,
  placeAt,
  turnedPlace,
} from './rules.js';

/** A slide of a carousel: anything with an id that stays the same while the set changes. */
export type CarouselItem = Readonly<{ id: Key }>;

/** Where a carousel is in its set, and how to turn it; `useCarouselState` holds it. */
export type CarouselState<T extends CarouselItem> = Readonly<{
  /** The set, in order. */
  items: readonly T[];
  /** The place of the slide shown, from 0; 0 in an empty set. */
  index: number;
  /** The slide shown; none in an empty set. */
  current: T | undefined;
  /** Turns one slide back (-1) or on (1); at an end, nothing. */
  turnBy: (step: -1 | 1) => void;
  /** Turns to the slide with this id; nothing when the set has none. */
  turnTo: (id: Key) => void;
}>;

export type CarouselStateOptions<T extends CarouselItem> = Readonly<{
  /** The set, in order. It may change while the carousel shows it. */
  items: readonly T[];
  /**
   * The slide the carousel opens on; the first when it names none. A slide the set does not hold
   * yet, such as one in a page still being read, is awaited: the carousel shows the first slide
   * meanwhile, and goes to that one when it first arrives, unless the person has turned the
   * carousel before then.
   */
  defaultCurrentId?: Key;
}>;

/**
 * Where a `Carousel` (or a `MediaViewer`) is in its set, held by the component that shows it: the
 * slide shown, by identity, so a slide arriving or leaving before it does not turn the page; when
 * the slide shown leaves the set, the one now at its place is shown, and followed from there. The
 * slide it opens on is kept until it is first in the set. The component that holds it reads the
 * slide shown (`current`) and can turn the carousel itself (`turnTo`), such as from a strip of
 * thumbnails beside it.
 */
export const useCarouselState = <T extends CarouselItem>({
  items,
  defaultCurrentId,
}: CarouselStateOptions<T>): CarouselState<T> => {
  const ids = items.map((item) => item.id);
  const [place, setPlace] = useState(() => openingPlace(ids, defaultCurrentId));
  // The set changed under the place: the slide it was on moved, left, or arrived at last. Set
  // while rendering, as React allows for state that follows from the previous render, and only
  // when it differs (`followedPlace` gives back the same place when nothing is to change).
  const followed = followedPlace(ids, place);
  if (followed !== place) {
    setPlace(followed);
  }
  const index = currentIndex(ids, followed);
  return {
    items,
    index,
    current: items[index],
    turnBy: (step) => setPlace((at) => turnedPlace(ids, at, step)),
    turnTo: (id) => {
      const found = ids.indexOf(id);
      if (found >= 0) {
        setPlace(placeAt(ids, found));
      }
    },
  };
};
