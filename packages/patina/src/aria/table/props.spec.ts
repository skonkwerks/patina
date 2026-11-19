import type { ReactElement, ReactNode } from 'react';
import { describe, expectTypeOf, it } from 'vitest';

import type { TableLoadMore, TableProps } from './index.js';

/** What every table is given: its name and its empty state. */
type Named = { 'aria-label': string; emptyState: { title: string } };

// The checks are on the types alone: the type check holds them, and the runner finds nothing to run
// in them but their names.
describe('TableProps', () => {
  it('takes a filter and a pagination on a table that holds every row', () => {
    expectTypeOf<
      Named & { filter: ReactNode; pagination: ReactNode }
    >().toExtend<TableProps>();
  });

  it('takes neither a filter nor a pagination beside a Load more bar', () => {
    expectTypeOf<
      Named & { loadMore: TableLoadMore; filter: ReactNode }
    >().not.toExtend<TableProps>();
    expectTypeOf<
      Named & { loadMore: TableLoadMore; pagination: ReactNode }
    >().not.toExtend<TableProps>();
    // Nor beside a bar given only while a next page may be read.
    expectTypeOf<
      Named & { loadMore: TableLoadMore | undefined; filter: ReactNode }
    >().not.toExtend<TableProps>();
  });

  it("takes an empty state as the control's props or as content, never nothing", () => {
    expectTypeOf<{
      'aria-label': string;
      emptyState: ReactElement;
    }>().toExtend<TableProps>();
    expectTypeOf<{
      'aria-label': string;
      emptyState: undefined;
    }>().not.toExtend<TableProps>();
    expectTypeOf<{
      'aria-label': string;
      emptyState: null;
    }>().not.toExtend<TableProps>();
    expectTypeOf<{
      'aria-label': string;
      emptyState: false;
    }>().not.toExtend<TableProps>();
  });

  it('takes a Load more bar alone', () => {
    expectTypeOf<
      Named & { loadMore: TableLoadMore | undefined }
    >().toExtend<TableProps>();
  });
});
