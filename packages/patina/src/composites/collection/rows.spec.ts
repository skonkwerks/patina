import { describe, expect, it } from 'vitest';

import { compareByField, matchRows, pageRows, sortRows } from './rows.js';

type Invoice = { id: string; customer: string; amount: number; note?: string };

const invoices: Invoice[] = [
  { id: '1042', customer: 'Northwind Traders', amount: 1240 },
  { id: '1043', customer: 'Contoso Pharmaceuticals', amount: 86.5 },
  { id: '1044', customer: 'Fabrikam', amount: 12900, note: 'Rush' },
  { id: '1045', customer: 'Tailspin Toys', amount: 430.25 },
];

/** Case-blind, as React Aria's `useFilter` with `sensitivity: 'base'` compares for these words. */
const contains = (text: string, query: string) =>
  text.toLowerCase().includes(query.toLowerCase());

const ids = (rows: readonly Invoice[]) => rows.map((row) => row.id).join(' ');

describe('matchRows', () => {
  it('matches every row for an empty search', () => {
    expect(ids(matchRows(invoices, '', undefined, contains))).toBe(
      '1042 1043 1044 1045',
    );
  });

  it('matches a row with any field that holds the search, as Cloudscape does', () => {
    expect(ids(matchRows(invoices, 'toys', undefined, contains))).toBe('1045');
    expect(ids(matchRows(invoices, '1043', undefined, contains))).toBe('1043');
    expect(ids(matchRows(invoices, '12900', undefined, contains))).toBe('1044');
    expect(ids(matchRows(invoices, 'rush', undefined, contains))).toBe('1044');
  });

  it('never matches across two fields', () => {
    expect(ids(matchRows(invoices, '1045 Tailspin', undefined, contains))).toBe(
      '',
    );
  });

  it('looks only in the given fields', () => {
    expect(ids(matchRows(invoices, '1043', ['customer'], contains))).toBe('');
    expect(ids(matchRows(invoices, 'contoso', ['customer'], contains))).toBe(
      '1043',
    );
  });
});

describe('sortRows with compareByField', () => {
  const compare = compareByField(new Intl.Collator('en', { numeric: true }));

  it('keeps the order without a sort', () => {
    expect(ids(sortRows(invoices, undefined, compare))).toBe(
      '1042 1043 1044 1045',
    );
  });

  it("sorts text in the locale's order, both ways", () => {
    expect(
      ids(
        sortRows(
          invoices,
          { column: 'customer', direction: 'ascending' },
          compare,
        ),
      ),
    ).toBe('1043 1044 1042 1045');
    expect(
      ids(
        sortRows(
          invoices,
          { column: 'customer', direction: 'descending' },
          compare,
        ),
      ),
    ).toBe('1045 1042 1044 1043');
  });

  it('sorts numbers as numbers', () => {
    expect(
      ids(
        sortRows(
          invoices,
          { column: 'amount', direction: 'ascending' },
          compare,
        ),
      ),
    ).toBe('1043 1045 1042 1044');
  });

  it('sorts a row without the value as the largest', () => {
    const byNote = (direction: 'ascending' | 'descending') =>
      ids(sortRows(invoices, { column: 'note', direction }, compare));
    expect(byNote('ascending')).toBe('1044 1042 1043 1045');
    expect(byNote('descending')).toBe('1042 1043 1045 1044');
  });
});

describe('pageRows', () => {
  const many = Array.from({ length: 23 }, (_, index) => index + 1);

  it('gives the page asked for, and how many there are', () => {
    const page = pageRows(many, 10, 2);
    expect(page.pageCount).toBe(3);
    expect(page.page).toBe(2);
    expect(page.rows).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });

  it('gives the last page when the one asked for is past it', () => {
    const page = pageRows(many, 10, 7);
    expect(page.page).toBe(3);
    expect(page.rows).toEqual([21, 22, 23]);
  });

  it('gives no pages, and page 1 empty, for no rows', () => {
    expect(pageRows([], 10, 4)).toEqual({ pageCount: 0, page: 1, rows: [] });
  });
});
