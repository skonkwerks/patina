import { describe, expect, it } from 'vitest';

import { pagePlaces } from './pages.js';

/** The places as text: each page's number, and `…` for each ellipsis. */
const shown = (page: number, pageCount: number) =>
  pagePlaces(page, pageCount)
    .map((place) => (place === 'gap' ? '…' : String(place)))
    .join(' ');

describe('pagePlaces', () => {
  it('shows every page while they fit', () => {
    expect(shown(1, 1)).toBe('1');
    expect(shown(1, 2)).toBe('1 2');
    expect(shown(5, 9)).toBe('1 2 3 4 5 6 7 8 9');
  });

  it('shows page 1 alone when there are none', () => {
    expect(shown(1, 0)).toBe('1');
  });

  it('leaves out the pages far from the current one, as Cloudscape does', () => {
    expect(shown(1, 10)).toBe('1 2 3 4 5 6 7 … 10');
    expect(shown(6, 20)).toBe('1 … 4 5 6 7 8 … 20');
    expect(shown(20, 20)).toBe('1 … 14 15 16 17 18 19 20');
  });

  it('never has an ellipsis stand for one page alone', () => {
    expect(shown(5, 20)).toBe('1 2 3 4 5 6 7 … 20');
    expect(shown(15, 20)).toBe('1 … 13 14 15 16 17 … 20');
    expect(shown(16, 20)).toBe('1 … 14 15 16 17 18 19 20');
    expect(shown(5, 10)).toBe('1 2 3 4 5 6 7 … 10');
    expect(shown(6, 10)).toBe('1 … 4 5 6 7 8 9 10');
  });
});
