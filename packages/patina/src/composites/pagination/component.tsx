import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useState } from 'react';
import { useLocale } from 'react-aria-components';

import { ButtonBase } from '../../aria/button/base.js';
import { IconButton } from '../../aria/iconbutton/index.js';
import { useMessages } from '../../internal/messages.js';
import { pagePlaces } from './pages.js';
import { paginationPageStyles, paginationStyles } from './styles.js';

export type PaginationProps = {
  /** What the pages are of, as the list's name: "Invoice pages". */
  'aria-label': string;
  /** How many pages there are; with none, page 1 is shown and both arrows are disabled. */
  pageCount: number;
  /** The page shown, counted from 1, held by the app (controlled). */
  page?: number;
  /** The page shown first, counted from 1, held by the pagination (uncontrolled). By default 1. */
  defaultPage?: number;
  /** A page was chosen: by its number, or by an arrow. */
  onChange?: (page: number) => void;
  /** The arrow to the page before; by default the words in force ("Previous page"). */
  previousLabel?: string;
  /** The arrow to the page after; by default the words in force ("Next page"). */
  nextLabel?: string;
  /** A page's button, named by its number; by default the words in force ("Page 3"). */
  pageLabel?: (page: number) => string;
  /**
   * Why the arrow to the page before cannot be pressed on the first page; by default the words in
   * force ("This is the first page").
   */
  firstPageReason?: string;
  /**
   * Why the arrow to the page after cannot be pressed on the last page; by default the words in
   * force ("This is the last page").
   */
  lastPageReason?: string;
};

/**
 * Moves between the pages of what the rows hold, as Cloudscape's pagination: the arrows, the first
 * and the last page, and up to seven places between them around the current one, an ellipsis
 * taking one for each run of pages left out. The current page is marked (`aria-current`). It
 * stands in a table's `pagination` slot, for a table that holds every row; `useCollection` gives
 * it its props.
 */
export const Pagination = ({
  'aria-label': ariaLabel,
  pageCount,
  page,
  defaultPage = 1,
  onChange,
  previousLabel,
  nextLabel,
  pageLabel,
  firstPageReason,
  lastPageReason,
}: PaginationProps) => {
  const words = useMessages().pagination;
  const number = new Intl.NumberFormat(useLocale().locale);
  const [ownPage, setOwnPage] = useState(defaultPage);
  const current = page ?? ownPage;
  const choose = (chosen: number) => {
    if (page === undefined) {
      setOwnPage(chosen);
    }
    onChange?.(chosen);
  };
  const nameOf = pageLabel ?? words.pageLabel;
  const styles = paginationStyles();
  const pageButton = (shown: number) => (
    <li key={shown}>
      <ButtonBase
        aria-label={nameOf(shown)}
        aria-current={shown === current ? 'page' : undefined}
        onPress={() => choose(shown)}
        styles={(state) =>
          paginationPageStyles({ ...state, isCurrent: shown === current })
        }
        pendingIndicator='replace'
        spinnerSize='sm'
      >
        {number.format(shown)}
      </ButtonBase>
    </li>
  );
  return (
    <ul aria-label={ariaLabel} className={styles.root()}>
      <li>
        <IconButton
          aria-label={previousLabel ?? words.previousLabel}
          // On the first page the arrow says why it cannot be pressed, and stays focusable.
          disabledReason={
            current <= 1
              ? (firstPageReason ?? words.firstPageReason)
              : undefined
          }
          onPress={() => choose(current - 1)}
        >
          <IconChevronLeft aria-hidden className='size-4 rtl:rotate-180' />
        </IconButton>
      </li>
      {pagePlaces(current, pageCount).map((place, index) =>
        place === 'gap' ? (
          // At most one ellipsis stands before the current page, always second in the row, and
          // one after it.
          <li
            key={index === 1 ? 'gap-before' : 'gap-after'}
            aria-hidden
            className={styles.gap()}
          >
            …
          </li>
        ) : (
          pageButton(place)
        ),
      )}
      <li>
        <IconButton
          aria-label={nextLabel ?? words.nextLabel}
          disabledReason={
            current >= pageCount
              ? (lastPageReason ?? words.lastPageReason)
              : undefined
          }
          onPress={() => choose(current + 1)}
        >
          <IconChevronRight aria-hidden className='size-4 rtl:rotate-180' />
        </IconButton>
      </li>
    </ul>
  );
};
