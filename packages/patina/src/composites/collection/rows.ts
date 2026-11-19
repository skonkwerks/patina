import type { Key, SortDescriptor } from 'react-aria-components';

/** Whether a text holds a search's text, as React Aria's `useFilter` decides it. */
export type Contains = (text: string, query: string) => boolean;

/**
 * The texts a search looks in: the given fields' values, or all of a row's, that are text or
 * numbers.
 */
const textsOf = <T extends object>(
  item: T,
  fields: readonly (keyof T)[] | undefined,
): string[] => {
  const values: readonly unknown[] =
    fields === undefined
      ? Object.values(item)
      : fields.map((field) => item[field]);
  return values
    .filter(
      (value): value is string | number =>
        typeof value === 'string' || typeof value === 'number',
    )
    .map(String);
};

/**
 * The rows a search matches, as Cloudscape's: those with a field that holds its text. An empty
 * search matches every row.
 */
export const matchRows = <T extends object>(
  items: readonly T[],
  query: string,
  fields: readonly (keyof T)[] | undefined,
  contains: Contains,
): T[] =>
  query === ''
    ? [...items]
    : items.filter((item) =>
        textsOf(item, fields).some((text) => contains(text, query)),
      );

/**
 * What a field's value sorts by: a number or a date as a number, text or a yes or no as text, and
 * nothing for any other value, which sorts as a missing one does.
 */
const sortValue = (value: unknown): number | string | undefined => {
  if (typeof value === 'number') {
    return value;
  }
  if (value instanceof Date) {
    return value.getTime();
  }
  if (
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return String(value);
  }
  return undefined;
};

/**
 * Orders two rows by a column ascending: by the value of the field the column's id names, numbers
 * and dates as numbers and the rest as text in the locale's order. A row without such a value
 * sorts as the largest, so it comes last ascending and first descending, the one order reversed.
 */
export const compareByField =
  (collator: Intl.Collator) =>
  <T extends object>(a: T, b: T, column: Key): number => {
    const first = sortValue(Reflect.get(a, column));
    const second = sortValue(Reflect.get(b, column));
    if (first === undefined) {
      return second === undefined ? 0 : 1;
    }
    if (second === undefined) {
      return -1;
    }
    if (typeof first === 'number' && typeof second === 'number') {
      return first - second;
    }
    return collator.compare(String(first), String(second));
  };

/**
 * The rows in the sort's order, or as they are without a sort. A sort keeps equal rows in order.
 */
export const sortRows = <T extends object>(
  items: readonly T[],
  sort: SortDescriptor | undefined,
  compare: (a: T, b: T, column: Key) => number,
): T[] => {
  if (sort === undefined) {
    return [...items];
  }
  const sign = sort.direction === 'descending' ? -1 : 1;
  return [...items].sort((a, b) => sign * compare(a, b, sort.column));
};

/**
 * One page of the rows, as Cloudscape's: how many pages there are, the page shown, and its rows.
 */
export type RowsPage<T> = Readonly<{
  /** How many pages the rows fill; none for no rows. */
  pageCount: number;
  /** The page shown, counted from 1: the one asked for, or the last there is when it is past it. */
  page: number;
  rows: T[];
}>;

/** The page of `pageSize` rows asked for, moved back to the last page when the rows have shrunk. */
export const pageRows = <T>(
  items: readonly T[],
  pageSize: number,
  page: number,
): RowsPage<T> => {
  const pageCount = Math.ceil(items.length / pageSize);
  const shown = Math.max(1, Math.min(page, pageCount));
  return {
    pageCount,
    page: shown,
    rows: items.slice((shown - 1) * pageSize, shown * pageSize),
  };
};
