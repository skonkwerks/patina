import type { CarouselItem } from './state.ts';
import { carouselDotsStyles } from './styles.ts';

/**
 * A sidecar of `Carousel`, private to the carousel family: a dot for each slide of a set of up to
 * nine, the current one marked. It is decoration beside the position's words, which say the same,
 * so it is hidden from assistive technology and takes no press.
 */
const C = ({
  items,
  index,
}: {
  items: readonly CarouselItem[];
  index: number;
}) => (
  <div aria-hidden className={carouselDotsStyles().root()}>
    {items.map((item, slide) => (
      <span
        key={item.id}
        className={carouselDotsStyles({ isCurrent: slide === index }).dot()}
      />
    ))}
  </div>
);

C.displayName = 'CarouselDots';
export default C;
