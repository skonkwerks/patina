import type { ReactNode } from 'react';

import {
  Carousel,
  type CarouselBaseProps,
  type CarouselItem,
  type CarouselName,
  useCarouselKeyboard,
} from '../carousel/index.js';
import { mediaViewerStyles } from './styles.js';

/**
 * What a media viewer shows and says, whatever hosts it: the carousel's slides and words, and what
 * stands under it. `MediaViewer` takes it with its name and its state, and `MediaViewerDialog` with
 * its set and its title.
 */
export type MediaViewerContentProps<T extends CarouselItem> = Omit<
  CarouselBaseProps<T>,
  'state' | 'role' | 'className'
> & {
  /** What the current slide is, in words, on one line under the carousel, cut at its end. */
  renderCaption?: (item: T) => ReactNode;
  /**
   * The current slide's controls, after its caption on the same line, such as its rating. A control
   * here is drawn for each slide in turn, so it takes its value from the slide it is given.
   */
  renderActions?: (item: T) => ReactNode;
  /**
   * The current slide's longer text, such as the prompt it was made from, the whole width under
   * the caption line, in an area of one height for every slide that scrolls past it: 6rem, or
   * `--media-viewer-details-height` when the caller sets it (`[--media-viewer-details-height:10rem]`
   * in `className`) for its text's common length.
   */
  renderDetails?: (item: T) => ReactNode;
};

export type MediaViewerProps<T extends CarouselItem> =
  MediaViewerContentProps<T> &
    CarouselName &
    Pick<CarouselBaseProps<T>, 'state' | 'role'> & {
      /**
       * Layout and size: the viewer fills the height it is given (32rem unless the caller gives
       * another), and its carousel takes what the caption line and the details leave.
       */
      className?: string;
    };

/**
 * A set of pictures or videos to go through one at a time, as large as its room allows, with what
 * the current one is and what can be done with it under it: the `Carousel` (its frame, Previous and
 * Next, its position, its keys and drag, and every rule it keeps), then the caption line (the
 * caption, then the actions) and the details. It stands wherever it is put, and behaves the same:
 * inline on a page, named by the page's own heading over it (`aria-labelledby`), or in a dialog,
 * which `MediaViewerDialog` gives it, with its title and full screen. The arrow keys turn it while
 * the focus is anywhere in it, its caption line and details included, and not in a control there
 * that uses them; two viewers on a page each take only their own. The component that shows it
 * holds where it is (`useCarouselState`), so it can read the current slide and turn it. It does
 * not fit its picture: its size is the one its caller gives it, and stays the same while the
 * slides turn, since a picture of another shape sits whole inside the frame with bars, and the
 * caption line and the details area are each one height for every slide; so nothing moves between
 * pictures of different shapes or texts of different lengths, the frame, Previous, and Next
 * included.
 */
export const MediaViewer = <T extends CarouselItem>({
  renderCaption,
  renderActions,
  renderDetails,
  className,
  ...carousel
}: MediaViewerProps<T>) => {
  const { current } = carousel.state;
  const keyboard = useCarouselKeyboard(carousel.state);
  const styles = mediaViewerStyles();
  return (
    // The viewer's own area takes the arrow keys, as its carousel does: the carousel prevents a
    // press it takes, so one press never turns it twice.
    <div className={styles.root({ className })} {...keyboard}>
      <Carousel {...carousel} className={styles.carousel()} />
      {(renderCaption !== undefined || renderActions !== undefined) && (
        <div className={styles.captionLine()}>
          <div className={styles.caption()}>
            {current && renderCaption?.(current)}
          </div>
          {renderActions && (
            <div className={styles.actions()}>
              {current && renderActions(current)}
            </div>
          )}
        </div>
      )}
      {renderDetails && (
        // A Tab stop, so a longer text can be scrolled from the keyboard: an area that scrolls is
        // reachable by the keyboard only when it takes the focus, and not every browser makes it.
        <div tabIndex={0} className={styles.details()}>
          {current && renderDetails(current)}
        </div>
      )}
    </div>
  );
};
