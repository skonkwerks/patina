import { tv } from 'tailwind-variants';

import { focusVisibleRing } from '../../internal/focus.js';

/**
 * A carousel's parts. The root is a column of a given height (20rem unless the caller sizes it):
 * the row of Previous, the frame's room, and Next takes what the position line under it leaves.
 * The room is a size container, so the frame is the largest box of the set's shape the room holds
 * (`hasShape`), or the whole room, with no size worked out from anything around it. The frame
 * clips the strip of slides, which slides inside it. The root takes the focus when what held it
 * goes away (a slide out of view or out of the set, the scrubber, Previous and Next in an empty
 * set) or from a press on the frame, and then shows the shared focus ring (`focusVisibleRing`).
 * Its text takes the color of where it stands.
 */
export const carouselStyles = tv({
  slots: {
    root: [focusVisibleRing(), 'flex h-80 min-w-0 flex-col gap-2 rounded-md'],
    row: 'flex min-h-0 flex-1 items-center gap-2',
    room: '[container-type:size] flex min-h-0 min-w-0 flex-1 items-center justify-center self-stretch',
    // The canvas shows where a slide's shape differs from the frame's.
    frame: 'bg-canvas relative overflow-hidden rounded-md',
    strip: 'absolute inset-0 select-none',
    slide:
      'absolute inset-y-0 flex w-full items-center justify-center overflow-hidden',
    // A chevron points toward the slide it turns to, so it turns round in a right-to-left layout.
    buttonIcon: 'size-5 rtl:-scale-x-100',
    position: 'flex h-8 shrink-0 items-center justify-center gap-3 text-sm',
    positionText: 'shrink-0 tabular-nums',
  },
  variants: {
    // With a shape, the frame's width and its aspect ratio are set where it is drawn, from the
    // shape's numbers, within 100% of the room either way.
    hasShape: {
      true: { frame: 'max-h-full max-w-full' },
      false: { frame: 'size-full' },
    },
    // A frame that turns by a drag says so to the pointer, and leaves vertical swipes to the page.
    isDraggable: {
      true: { strip: 'cursor-grab touch-pan-y active:cursor-grabbing' },
    },
  },
});

/**
 * The dots of a set of up to nine: the current one a wider bar in the primary color, so its shape
 * says which it is as well as its color, the others the control edge's color, which stands out
 * from every layer.
 */
export const carouselDotsStyles = tv({
  slots: {
    root: 'flex items-center gap-1.5',
    dot: 'h-1.5 rounded-full transition-[width] motion-reduce:transition-none',
  },
  variants: {
    isCurrent: {
      true: { dot: 'bg-primary w-4' },
      false: { dot: 'bg-control-border w-1.5' },
    },
  },
});

/**
 * The scrubber of a set past nine: a slider's track (`sliderStyles`) across the line, and over it,
 * while the pointer is over the track or drags the thumb, the preview of the slide it names: its
 * picture in a square, and its position in words. The preview stands on the overlay layer, as a
 * popover does.
 */
export const carouselScrubberStyles = tv({
  slots: {
    root: 'min-w-0 flex-1',
    preview:
      'pointer-events-none absolute bottom-full z-10 mb-2 flex flex-col items-center gap-1',
    thumbnail:
      'bg-canvas border-overlay-border aspect-square w-full overflow-hidden rounded-md border shadow-md',
    previewText:
      'bg-overlay text-overlay-foreground border-overlay-border rounded border px-1.5 text-xs whitespace-nowrap tabular-nums shadow-sm',
  },
});
