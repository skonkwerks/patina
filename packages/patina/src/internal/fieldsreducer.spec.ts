import { describe, expect, it } from 'vitest';

import { fieldsReducer } from './fieldsreducer.js';

type NoteFields = Readonly<{ title: string; isPinned: boolean; size?: number }>;

const note: NoteFields = { title: 'Groceries', isPinned: false };

describe('fieldsReducer', () => {
  it('sets the one field named, and keeps the rest', () => {
    expect(
      fieldsReducer(note, {
        type: 'SET',
        payload: { field: 'isPinned', value: true },
      }),
    ).toEqual({ title: 'Groceries', isPinned: true });
  });

  it('adds an optional field the state did not hold yet', () => {
    expect(
      fieldsReducer(note, {
        type: 'SET',
        payload: { field: 'size', value: 3 },
      }),
    ).toEqual({ ...note, size: 3 });
  });

  it('gives a new state and leaves the one it was given as it was', () => {
    const next = fieldsReducer(note, {
      type: 'SET',
      payload: { field: 'title', value: 'Errands' },
    });
    expect(next).not.toBe(note);
    expect(note).toEqual({ title: 'Groceries', isPinned: false });
  });

  it('gives the same state for a value the field already holds', () => {
    expect(
      fieldsReducer(note, {
        type: 'SET',
        payload: { field: 'title', value: 'Groceries' },
      }),
    ).toBe(note);
  });
});
