import { describe, expect, it } from 'vitest';

import { englishMessages, overrideMessages } from './messages.js';

describe('overrideMessages', () => {
  it('keeps every word when none is given', () => {
    expect(overrideMessages(englishMessages, undefined)).toEqual(
      englishMessages,
    );
    expect(overrideMessages(englishMessages, {})).toEqual(englishMessages);
  });

  it("puts each given word in place of the base's, and keeps the rest", () => {
    const words = overrideMessages(englishMessages, {
      pagination: { nextLabel: 'Nächste Seite' },
    });
    expect(words.pagination.nextLabel).toBe('Nächste Seite');
    expect(words.pagination.previousLabel).toBe('Previous page');
    expect(words.pagination.pageLabel(3)).toBe('Page 3');
  });

  it("keeps the base's word where a word is given as undefined", () => {
    const words = overrideMessages(englishMessages, {
      pagination: { nextLabel: undefined },
    });
    expect(words.pagination.nextLabel).toBe('Next page');
  });

  it('builds on the words above it, as a provider inside another does', () => {
    const outer = overrideMessages(englishMessages, {
      pagination: { previousLabel: 'Vorherige Seite' },
    });
    const inner = overrideMessages(outer, {
      pagination: { nextLabel: 'Weiter' },
    });
    expect(inner.pagination.previousLabel).toBe('Vorherige Seite');
    expect(inner.pagination.nextLabel).toBe('Weiter');
  });
});
