import { TokenFieldValue } from 'react-aria-components';

/**
 * A token field's value, React Aria's `TokenFieldValue`, re-exported so an app's whole use of the
 * token field, the value it builds and subclasses included, comes through this subpath.
 */
export { TokenFieldValue };

/** One piece of a token field's value: some text, or a token. */
export type TokenFieldSegment<T = unknown> =
  TokenFieldValue<T>['segments'][number];

/** A token piece of a value, with the optional `value` the app gives it. */
export type TokenSegment<T = unknown> = Extract<
  TokenFieldSegment<T>,
  { type: 'token' }
>;

/** A text piece of a value. */
export type TextSegment = Extract<TokenFieldSegment, { type: 'text' }>;
