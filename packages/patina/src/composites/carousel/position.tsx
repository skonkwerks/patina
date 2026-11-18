import { useState } from 'react';

import Dots from './dots.tsx';
import type { IndicatorKind } from './rules.ts';
import Scrubber from './scrubber.tsx';
import type { CarouselItem } from './state.ts';
import { carouselStyles } from './styles.ts';
import type { CarouselIndicator } from './types.ts';

type PositionProps<T extends CarouselItem> = {
  items: readonly T[];
  index: number;
  /** Which indicator the set has: none, its dots, or its scrubber. */
  kind: IndicatorKind;
  positionText: (position: number, count: number) => string;
  indicator: CarouselIndicator<T> | undefined;
  /** Turns to the slide at this index, which the scrubber was left on. */
  onTurn: (index: number) => void;
};

/**
 * A sidecar of `Carousel`, private to the carousel family: the line under the frame, one height
 * whatever it holds. It always says where the carousel is in the app's words ("3 of 12"), a status
 * that is announced politely as the slide changes, and nothing in an empty set; with an
 * `indicator`, the dots or the scrubber beside the words. While the scrubber holds the focus, the
 * status is not announced: the scrubber's value, in the same words, already is as it moves, and
 * the person would hear each slide twice.
 */
const C = <T extends CarouselItem>({
  items,
  index,
  kind,
  positionText,
  indicator,
  onTurn,
}: PositionProps<T>) => {
  const [isScrubberFocused, setIsScrubberFocused] = useState(false);
  // A scrubber that is gone holds no focus, though it went without a blur: removed with the focus
  // in it, it says nothing, so its last word is set right here, as React allows for state that
  // follows from the previous render.
  if (kind !== 'scrubber' && isScrubberFocused) {
    setIsScrubberFocused(false);
  }
  const count = items.length;
  const styles = carouselStyles();
  return (
    <div className={styles.position()}>
      <span
        role='status'
        aria-live={isScrubberFocused ? 'off' : 'polite'}
        className={styles.positionText()}
      >
        {count === 0 ? '' : positionText(index + 1, count)}
      </span>
      {indicator !== undefined && kind === 'dots' && (
        <Dots items={items} index={index} />
      )}
      {indicator !== undefined && kind === 'scrubber' && (
        <Scrubber
          items={items}
          index={index}
          positionText={positionText}
          indicator={indicator}
          onTurn={onTurn}
          onFocusChange={setIsScrubberFocused}
        />
      )}
    </div>
  );
};

C.displayName = 'CarouselPosition';
export default C;
