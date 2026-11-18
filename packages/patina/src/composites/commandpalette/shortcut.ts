import { useEffect, useEffectEvent } from 'react';

/**
 * Whether the platform's command modifier is Command (Apple's systems) rather than Control. Read
 * from the user agent, as the iPad's Safari reports itself as a Mac.
 */
const isApplePlatform = () => /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent);

/**
 * Whether the focus is in an open overlay. A modal dialog makes the rest of the page inert, so the
 * focus is inside it; React Aria renders a modal popover (a menu's, a select's) with the dialog
 * role, and the focus is in it too. A non-modal popover, such as a combo box's list, closes when its
 * field loses the focus, which the palette takes as it opens, so nothing stays open under it.
 */
const isInOverlay = (target: EventTarget | null) =>
  target instanceof Element &&
  target.closest('[role="dialog"], [role="alertdialog"]') !== null;

/**
 * Calls `open` when the person presses `key` with the platform's command modifier (Command on
 * Apple's systems, Control elsewhere) anywhere on the page, and keeps the browser's own use of the
 * keys from running. Nothing happens without a `key`; when something on the page already handled
 * the press (it called `preventDefault`, as an editor that binds the same key does); or while an
 * overlay is open, because a modal never opens over another overlay.
 *
 * An effect, because it subscribes to the document's key presses, which lie outside React.
 */
export const useOpenShortcut = (key: string | undefined, open: () => void) => {
  const onShortcut = useEffectEvent(open);
  useEffect(() => {
    if (key === undefined) {
      return;
    }
    const isApple = isApplePlatform();
    const onKeyDown = (event: KeyboardEvent) => {
      const hasModifier = isApple
        ? event.metaKey && !event.ctrlKey
        : event.ctrlKey && !event.metaKey;
      if (
        event.defaultPrevented ||
        !hasModifier ||
        event.altKey ||
        event.shiftKey ||
        event.key.toLowerCase() !== key.toLowerCase() ||
        isInOverlay(event.target)
      ) {
        return;
      }
      event.preventDefault();
      onShortcut();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [key]);
};
