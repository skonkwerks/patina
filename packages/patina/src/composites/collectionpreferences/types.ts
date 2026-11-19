/**
 * A table's preferences, as the app holds and stores them: the page size, and the table's looks
 * (`Table`'s `allowsWrapping`, `isStriped` and `isCompact`). The form offers each one the app
 * holds, so an app leaves out a preference it doesn't offer.
 */
export type CollectionPreferencesValue = Readonly<{
  /** How many rows a page holds, for `useCollection`'s `pagination.pageSize`. */
  pageSize?: number;
  allowsWrapping?: boolean;
  isStriped?: boolean;
  isCompact?: boolean;
}>;
