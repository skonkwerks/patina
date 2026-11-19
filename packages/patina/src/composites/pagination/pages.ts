/** A place in a pagination's row: a page's number, or an ellipsis standing for pages left out. */
export type PagePlace = number | 'gap';

/** How many places stand between the first page and the last, at most, an ellipsis taking one. */
const MIDDLE_PLACES = 7;

/** How many pages stand on either side of the current one when pages are left out on both sides. */
const AROUND = (MIDDLE_PLACES - 3) / 2;

/** The pages from `first` to `last`, both included. */
const pagesFrom = (first: number, last: number): number[] =>
  Array.from(
    { length: Math.max(0, last - first + 1) },
    (_, index) => first + index,
  );

/**
 * The places a pagination shows, in order: the first page, up to seven places after it, and the
 * last page, the same pages Cloudscape's pagination shows.
 *
 * - While every page fits, every page.
 * - Otherwise, the current page with two pages on either side, and an ellipsis on either side for
 *   the pages left out.
 * - An ellipsis never stands for one page alone: near the start or the end, where it would, the
 *   places run from that end instead, six pages and one ellipsis.
 *
 * With no pages, page 1 alone.
 */
export const pagePlaces = (page: number, pageCount: number): PagePlace[] => {
  const last = Math.max(1, pageCount);
  if (last - 2 <= MIDDLE_PLACES) {
    return pagesFrom(1, last);
  }
  // The pages an ellipsis before the current page's neighbours would stand for: 2 to page - 3.
  if (page - AROUND - 1 <= 2) {
    return [...pagesFrom(1, MIDDLE_PLACES), 'gap', last];
  }
  // The same after them: page + 3 to last - 1.
  if (page + AROUND + 1 >= last - 1) {
    return [1, 'gap', ...pagesFrom(last - MIDDLE_PLACES + 1, last)];
  }
  return [1, 'gap', ...pagesFrom(page - AROUND, page + AROUND), 'gap', last];
};
