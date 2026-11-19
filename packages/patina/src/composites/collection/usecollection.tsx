import { useState } from 'react';
import {
  type Key,
  type SortDescriptor,
  useFilter,
  useLocale,
} from 'react-aria-components';

import { Button } from '../../aria/button/index.js';
import type { TableEmptyState } from '../../aria/table/index.js';
import { focusPageHeading } from '../../header/index.js';
import { useMessages } from '../../internal/messages.js';
import { compareByField, matchRows, pageRows, sortRows } from './rows.js';

export type UseCollectionOptions<T extends object> = {
  /**
   * What the table shows when there are no rows at all: required, since only the app can say what
   * is empty (`ux/states-and-feedback.md`).
   */
  emptyState: TableEmptyState;
  /** How the search looks, as Cloudscape's `filtering`. */
  filtering?: {
    /** The fields a search looks in; by default every field whose value is text or a number. */
    fields?: readonly (keyof T)[];
    /**
     * What the table shows when the search matches no row; by default the words in force ("No
     * matches", "Nothing matches the search.") and a Clear search button. An app's own gives the
     * person a way to clear the search with `clearSearch`.
     */
    noMatchState?: TableEmptyState;
  };
  /** How the rows sort, as Cloudscape's `sorting`. */
  sorting?: {
    /** The sort the rows start in; by default none. */
    defaultSortDescriptor?: SortDescriptor;
    /**
     * Orders two rows by a column, ascending; by default by the field the column's `id` names,
     * numbers and dates as numbers and the rest as text in the locale's order.
     */
    compare?: (a: T, b: T, column: Key) => number;
  };
  /** Pages of rows, as Cloudscape's `pagination`; without it, one page holds every row. */
  pagination?: {
    /** How many rows a page holds. */
    pageSize: number;
  };
};

export type UseCollectionResult<T extends object> = {
  /** The rows the table shows: matched, sorted, and the page's. */
  items: T[];
  /** How many rows the search matches; every row while there is none. */
  matchCount: number;
  /** For the `Table`: its empty or no-match state, and its sort. */
  tableProps: {
    emptyState: TableEmptyState;
    sortDescriptor: SortDescriptor | undefined;
    onSortChange: (sort: SortDescriptor) => void;
  };
  /** For the `TextFilter`, beside its `label`: the text, and the count of matches. */
  filterProps: {
    value: string;
    onChange: (value: string) => void;
    countText: string;
  };
  /** For the `Pagination`, beside its `aria-label`: the page and how many there are. */
  paginationProps: {
    page: number;
    pageCount: number;
    onChange: (page: number) => void;
  };
  /**
   * Empties the search and gives the focus to the page's heading, as a no-match state's clear
   * button does: the button goes with the no-match state once the rows come back, and the focus
   * goes to something that stays (`ux/accessibility.md`, "Focus never falls").
   */
  clearSearch: () => void;
};

/**
 * Searches, sorts and pages a table's rows in the browser, as Cloudscape's `useCollection`, for a
 * table that holds every row: give it the rows, and give its props to the `Table`, the
 * `TextFilter` and the `Pagination`. The search and the sort take effect once the app places a
 * `TextFilter` or a column that `allowsSorting`; the rows are paged with `pagination`.
 *
 * - A search matches a row with a field that holds its text, as React Aria's `useFilter` compares
 *   text in the locale (case and accents aside), and counts the matches in the words in force.
 * - A new search or sort goes back to the first page. A page past the last, when the rows shrink,
 *   becomes the last, and stays so when they grow again.
 * - With no rows at all the table shows the app's `emptyState`; with rows but none the search
 *   matches, the no-match state.
 *
 * It holds no selection. A table that lets the person select rows keeps the selection itself and,
 * as `ux/lists.md` asks, never acts on a row the search hides.
 */
export const useCollection = <T extends object>(
  items: readonly T[],
  { emptyState, filtering, sorting, pagination }: UseCollectionOptions<T>,
): UseCollectionResult<T> => {
  const words = useMessages().collection;
  const { contains } = useFilter({ sensitivity: 'base' });
  const collator = new Intl.Collator(useLocale().locale, { numeric: true });
  const [filterText, setFilterText] = useState('');
  const [sort, setSort] = useState(sorting?.defaultSortDescriptor);
  const [page, setPage] = useState(1);

  const search = (text: string) => {
    setFilterText(text);
    setPage(1);
  };
  const clearSearch = () => {
    search('');
    focusPageHeading();
  };
  const matched = matchRows(items, filterText, filtering?.fields, contains);
  const sorted = sortRows(
    matched,
    sort,
    sorting?.compare ?? compareByField(collator),
  );
  const shown =
    pagination === undefined
      ? { pageCount: 1, page: 1, rows: sorted }
      : pageRows(sorted, pagination.pageSize, page);
  // A page past the last becomes the last, held as the page asked for (React allows state that
  // follows from a render), so the table stays on it when the rows grow again.
  if (shown.page !== page) {
    setPage(shown.page);
  }

  const noMatchState: TableEmptyState = filtering?.noMatchState ?? {
    title: words.noMatchTitle,
    description: words.noMatchDescription,
    actions: <Button onPress={clearSearch}>{words.clearSearchLabel}</Button>,
  };

  return {
    items: shown.rows,
    matchCount: matched.length,
    tableProps: {
      emptyState: items.length === 0 ? emptyState : noMatchState,
      sortDescriptor: sort,
      onSortChange: (next) => {
        setSort(next);
        setPage(1);
      },
    },
    filterProps: {
      value: filterText,
      onChange: search,
      countText: words.countText(matched.length),
    },
    paginationProps: {
      page: shown.page,
      pageCount: shown.pageCount,
      onChange: setPage,
    },
    clearSearch,
  };
};
