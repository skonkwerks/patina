import { produce } from 'immer';

import type { CollectionPreferencesValue } from './types.js';

/**
 * The form's state: the preferences the person has changed and not yet saved, and only those, as
 * `fieldsReducer` sets them. A preference the person hasn't touched stays out, so the form shows
 * the stored one, newer values included (`ux/forms.md`, "Save and Cancel").
 */
export type StagedPreferences = CollectionPreferencesValue;

/** The form's state when it opens: nothing staged. */
export const defaultStagedPreferences = (): StagedPreferences => ({});

/**
 * What the form shows and Save sends: the stored preferences, with each one the person changed in
 * place of the stored value. A staged page size counts only while the app offers its sizes, since
 * the form shows page size only then, and a value the form no longer shows is never sent.
 */
export const shownPreferences = (
  stored: CollectionPreferencesValue,
  staged: StagedPreferences,
  offersPageSize: boolean,
): CollectionPreferencesValue => ({
  ...stored,
  ...(offersPageSize
    ? staged
    : produce(staged, (shown) => {
        delete shown.pageSize;
      })),
});

/** Whether what the form shows is what is stored, so Save has nothing to send. */
export const isUnchanged = (
  shown: CollectionPreferencesValue,
  stored: CollectionPreferencesValue,
): boolean =>
  shown.pageSize === stored.pageSize &&
  shown.allowsWrapping === stored.allowsWrapping &&
  shown.isStriped === stored.isStriped &&
  shown.isCompact === stored.isCompact;
