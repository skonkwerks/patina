import { describe, expect, it } from 'vitest';

import { fieldsReducer } from '../../internal/fieldsreducer.js';
import {
  defaultStagedPreferences,
  isUnchanged,
  shownPreferences,
  type StagedPreferences,
} from './staged.js';

const stored = {
  pageSize: 10,
  allowsWrapping: false,
  isStriped: false,
  isCompact: false,
};

const nothing = defaultStagedPreferences();

const stripes = (staged: StagedPreferences, value: boolean) =>
  fieldsReducer(staged, {
    type: 'SET',
    payload: { field: 'isStriped', value },
  });

const pages = (staged: StagedPreferences, value: number) =>
  fieldsReducer(staged, {
    type: 'SET',
    payload: { field: 'pageSize', value },
  });

describe('shownPreferences', () => {
  it('shows what is stored while nothing is staged', () => {
    expect(shownPreferences(stored, nothing, true)).toEqual(stored);
  });

  it('shows a newer stored value in place of the one the form opened on', () => {
    const newer = { ...stored, pageSize: 50 };
    expect(shownPreferences(newer, nothing, true)).toEqual(newer);
  });

  it('keeps a staged change over a newer stored value, and takes the rest', () => {
    const staged = stripes(nothing, true);
    expect(
      shownPreferences(
        { ...stored, pageSize: 20, isStriped: false },
        staged,
        true,
      ),
    ).toEqual({ ...stored, pageSize: 20, isStriped: true });
  });

  it('adds the one preference staged, and no other the app does not hold', () => {
    expect(
      shownPreferences({ isCompact: false }, stripes(nothing, true), true),
    ).toEqual({ isCompact: false, isStriped: true });
  });

  it('shows a staged page size while the app offers its sizes', () => {
    expect(shownPreferences(stored, pages(nothing, 50), true)).toEqual({
      ...stored,
      pageSize: 50,
    });
  });

  it('drops a staged page size once the app stops offering sizes', () => {
    const staged = stripes(pages(nothing, 50), true);
    expect(shownPreferences(stored, staged, false)).toEqual({
      ...stored,
      isStriped: true,
    });
    expect(shownPreferences({ isStriped: false }, staged, false)).toEqual({
      isStriped: true,
    });
  });
});

describe('isUnchanged', () => {
  it('is true for what is stored', () => {
    expect(isUnchanged(stored, stored)).toBe(true);
  });

  it('is false once any preference differs', () => {
    expect(isUnchanged({ ...stored, pageSize: 20 }, stored)).toBe(false);
    expect(isUnchanged({ ...stored, allowsWrapping: true }, stored)).toBe(
      false,
    );
    expect(isUnchanged({ ...stored, isStriped: true }, stored)).toBe(false);
    expect(isUnchanged({ ...stored, isCompact: true }, stored)).toBe(false);
  });

  it('is true again when a change is taken back', () => {
    const back = stripes(stripes(nothing, true), false);
    expect(isUnchanged(shownPreferences(stored, back, true), stored)).toBe(
      true,
    );
  });

  it('is true when the stored value comes to equal the staged one', () => {
    const newer = { ...stored, isStriped: true };
    expect(
      isUnchanged(shownPreferences(newer, stripes(nothing, true), true), newer),
    ).toBe(true);
  });

  it('is true when the only staged change is a page size no longer offered', () => {
    expect(
      isUnchanged(shownPreferences(stored, pages(nothing, 50), false), stored),
    ).toBe(true);
  });
});
