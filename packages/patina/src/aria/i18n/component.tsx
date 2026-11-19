import { type ReactNode, use, useMemo } from 'react';
import {
  I18nProvider as AriaI18nProvider,
  useLocale,
} from 'react-aria-components';

import {
  MessagesContext,
  type MessagesOverrides,
  overrideMessages,
} from '../../internal/messages.js';

export type I18nProviderProps = {
  /**
   * The language and region, as a BCP 47 tag such as "de-DE", passed on to React Aria's own
   * `I18nProvider`: React Aria's words (a date field's segments, a table's announcements), its
   * dates and numbers, and the reading direction. Left out, the one above stays, or the browser's.
   */
  locale?: string;
  /**
   * The app's words in place of Patina's English, in that language: any group, any of its words.
   */
  messages?: MessagesOverrides;
  children: ReactNode;
};

/**
 * The language of everything under it, given once at the app's root, as Cloudscape's and React
 * Aria's are: React Aria's locale, and the words Patina's components show when the app gives none,
 * such as a pagination's "Next page". An app in English needs none. For one use, a component's own
 * prop wins where it has one, and otherwise one around that component gives its words. One inside
 * another changes only what it is given: the rest of the words, and the locale when it gives none,
 * stay those of the one above.
 */
export const I18nProvider = ({
  locale,
  messages,
  children,
}: I18nProviderProps) => {
  const above = use(MessagesContext);
  // The locale in force above: an outer provider's, or the browser's.
  const aboveLocale = useLocale().locale;
  // One set of words while neither the words above nor the app's change, so the components under
  // it are not rendered again for words that are the same; an app that keeps its `messages` object
  // between renders gets that.
  const words = useMemo(
    () => overrideMessages(above, messages),
    [above, messages],
  );
  // React Aria's provider is always placed, given the locale above when this one gives none: given
  // no locale at all it would take the browser's rather than the one above it, and placed only for
  // a locale it would replace the whole tree under it, the app's state and focus with it, when an
  // app goes between the browser's language and a chosen one.
  return (
    <AriaI18nProvider locale={locale ?? aboveLocale}>
      <MessagesContext value={words}>{children}</MessagesContext>
    </AriaI18nProvider>
  );
};
