import { useLayoutEffect, useRef, useState } from 'react';
import {
  Slider as AriaSlider,
  SliderThumb,
  SliderTrack,
  useLocale,
} from 'react-aria-components';

import { sliderStyles, sliderThumbStyles } from '../../aria/slider/index.ts';
import { scrubberFraction, scrubberPosition } from './rules.ts';
import type { CarouselItem } from './state.ts';
import { carouselScrubberStyles } from './styles.ts';
import type { CarouselIndicator } from './types.ts';

/** The preview's width, in rem: its picture is a square this wide. */
const PREVIEW_REM = 3.5;

type ScrubberProps<T extends CarouselItem> = {
  items: readonly T[];
  index: number;
  positionText: (position: number, count: number) => string;
  indicator: CarouselIndicator<T>;
  /** Turns to the slide at this index, where a drag or a key left the thumb. */
  onTurn: (index: number) => void;
  /** Whether the thumb holds the focus, as it takes and gives it up. */
  onFocusChange: (isFocused: boolean) => void;
};

/**
 * A sidecar of `Carousel`, private to the carousel family: the scrubber of a set past nine, React
 * Aria's slider over the slides' positions, drawn as the shared slider is, one bar however many
 * slides there are, so any slide is one drag away. While the pointer is over the track, the slide
 * under it is previewed above it, its picture (the app's `renderThumbnail`) and its position in
 * words; while the thumb is dragged, the slide it is dragged to. The carousel turns when a drag
 * ends, not for every slide passed on the way, and at each arrow, Page, Home, or End key, so from
 * the keyboard the frame itself shows each slide as the scrubber reaches it. The thumb stays at the
 * current slide while the pointer only passes over the track. The slider's value is the position
 * in the app's words ("4 of 12"), as the carousel's status says it; the preview is decoration. The
 * slider stops the keys it uses, so they never turn the carousel as well.
 */
const C = <T extends CarouselItem>({
  items,
  index,
  positionText,
  indicator,
  onTurn,
  onFocusChange,
}: ScrubberProps<T>) => {
  const isRightToLeft = useLocale().direction === 'rtl';
  // The slide the pointer is over, and the one the thumb is being moved to, by position from 1.
  const [pointed, setPointed] = useState<number>();
  const [moved, setMoved] = useState<number>();
  const count = items.length;
  const currentPosition = index + 1;
  const previewed = moved ?? pointed;
  const item = previewed === undefined ? undefined : items[previewed - 1];
  const value = moved ?? currentPosition;
  const thumbInput = useRef<HTMLInputElement>(null);
  const valueText = positionText(value, count);
  // The thumb's value text in the app's words. React Aria's slider takes no value text of the
  // caller's: `useSliderThumb` gives the thumb's input the slider state's own label, a number
  // formatted by `formatOptions`, and its state cannot be stood in for (its data is kept by the
  // state object's identity). So after each commit the words are set on the input itself, through
  // the thumb's documented `inputRef`; React sets that attribute only when its own label changes,
  // and this runs after it, so the words always stand when the browser reads them. This relies on
  // React Aria's implementation (react-aria-components 1.22.1), so check it on every upgrade: the
  // `WithScrubber` story asserts the value text, and fails if it changes.
  useLayoutEffect(() => {
    thumbInput.current?.setAttribute('aria-valuetext', valueText);
  });
  const styles = carouselScrubberStyles();
  const slider = sliderStyles();
  return (
    <AriaSlider<number>
      aria-label={indicator.scrubberLabel}
      minValue={1}
      maxValue={count}
      step={1}
      value={value}
      onChange={setMoved}
      onChangeEnd={(position) => {
        setMoved(undefined);
        if (position !== currentPosition) {
          onTurn(position - 1);
        }
      }}
      className={styles.root()}
    >
      <SliderTrack
        className={slider.track()}
        // Hover is the mouse's: a touch moves the thumb itself, which previews what it reaches.
        onPointerMove={(event) => {
          if (event.pointerType === 'mouse') {
            setPointed(
              scrubberPosition(
                event.clientX,
                event.currentTarget.getBoundingClientRect(),
                count,
                isRightToLeft,
              ),
            );
          }
        }}
        onHoverEnd={() => setPointed(undefined)}
      >
        <div className={slider.rail()} />
        {item !== undefined && previewed !== undefined && (
          <div
            aria-hidden
            className={styles.preview()}
            style={{
              width: `${PREVIEW_REM}rem`,
              // Over the slide's place on the track, and kept inside the track at either end.
              insetInlineStart: `clamp(0rem, ${scrubberFraction(previewed, count) * 100}% - ${PREVIEW_REM / 2}rem, 100% - ${PREVIEW_REM}rem)`,
            }}
          >
            <div className={styles.thumbnail()}>
              {indicator.renderThumbnail(item)}
            </div>
            <span className={styles.previewText()}>
              {positionText(previewed, count)}
            </span>
          </div>
        )}
        <SliderThumb
          inputRef={thumbInput}
          className={(thumb) => sliderThumbStyles(thumb)}
          onFocusChange={onFocusChange}
        />
      </SliderTrack>
    </AriaSlider>
  );
};

C.displayName = 'CarouselScrubber';
export default C;
