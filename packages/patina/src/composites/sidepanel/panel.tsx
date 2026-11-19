import { IconX } from '@tabler/icons-react';
import { useCallback, useId } from 'react';

import { IconButton } from '../../aria/iconbutton/index.js';
import {
  useSidePanelActions,
  useSidePanelId,
  useSidePanelState,
} from './context.js';
import { sidePanelStyles } from './styles.js';

/** The custom property that says how much room the side panel takes at the right edge. */
const SIDE_PANEL_OFFSET = '--side-panel-offset';

export type SidePanelProps = {
  /** The name of the panel's close control, such as "Close". */
  closeLabel: string;
};

/**
 * The shell's one side panel: an `aside` at the right edge that has no width until an opener shows
 * its content in it, then pushes the page aside rather than covering it. It is not modal, so the
 * page stays usable. Opening it moves the focus to its close control; the close control or Escape
 * anywhere in it closes it and returns the focus to the control that opened it, except while a
 * write started from its content is pending. An opener's content is rendered into its body from the
 * page (`useSidePanel`), so it keeps that page's state and providers. `AppShell` renders it.
 * While it is mounted it sets `--side-panel-offset` on the document's root element to the room it
 * takes, so what stands at the right edge can stand clear of it.
 */
export const SidePanel = ({ closeLabel }: SidePanelProps) => {
  const { isOpen, title, isHeld } = useSidePanelState();
  const { close, setContentTarget } = useSidePanelActions();
  const panelId = useSidePanelId();
  const titleId = useId();
  // Escape anywhere in the panel closes it, once the control the person is in has had its turn.
  // The panel listens on the document, after React's own handlers: an Escape a control inside the
  // panel uses (a search field clearing its text, a list clearing its selection) is stopped there and
  // never arrives, and an unused one arrives with its target inside the panel. Content rendered here
  // from another part of the React tree is inside the panel's element all the same. A modal opened
  // from the content stands outside it, so its Escape closes the modal alone. Memoized on `close`,
  // so the panel's ref (below) stays the same from one render to the next.
  const escapeCloses = useCallback(
    (panel: HTMLElement | null) => {
      if (!panel) {
        return undefined;
      }
      const document = panel.ownerDocument;
      const onKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === 'Escape' &&
          !event.defaultPrevented &&
          event.target instanceof Node &&
          panel.contains(event.target)
        ) {
          close();
        }
      };
      document.addEventListener('keydown', onKeyDown);
      return () => document.removeEventListener('keydown', onKeyDown);
    },
    [close],
  );
  // The room the panel takes at the right edge, its width as drawn (none while closed, and each
  // step of its opening and closing), set as `--side-panel-offset` on the document's root element:
  // the one place it is held, which reaches what React Aria renders into the document's body, such
  // as the toast region, as well as the page. Memoized, so the panel's ref stays the same.
  const publishesOffset = useCallback((panel: HTMLElement | null) => {
    if (!panel) {
      return undefined;
    }
    const root = panel.ownerDocument.documentElement;
    const observer = new ResizeObserver(() => {
      root.style.setProperty(
        SIDE_PANEL_OFFSET,
        `${panel.getBoundingClientRect().width}px`,
      );
    });
    observer.observe(panel);
    return () => {
      observer.disconnect();
      root.style.removeProperty(SIDE_PANEL_OFFSET);
    };
  }, []);
  // One ref for both, memoized on them: a new ref at each render would have React run both
  // cleanups and set both up again on every render, unsetting the offset and the Escape listener
  // between them.
  const panelRef = useCallback(
    (panel: HTMLElement | null) => {
      const stopEscape = escapeCloses(panel);
      const stopOffset = publishesOffset(panel);
      return () => {
        stopEscape?.();
        stopOffset?.();
      };
    },
    [escapeCloses, publishesOffset],
  );
  const styles = sidePanelStyles({ isOpen });

  return (
    <aside
      id={panelId}
      ref={panelRef}
      aria-labelledby={isOpen ? titleId : undefined}
      // Closed, the panel is an empty column of no width, with nothing to reach: it is only kept
      // from being announced as a landmark.
      aria-hidden={isOpen ? undefined : true}
      className={styles.root()}
    >
      {isOpen && (
        <div className={styles.frame()}>
          <div className={styles.header()}>
            <h2 id={titleId} className={styles.title()}>
              {title}
            </h2>
            <IconButton
              autoFocus
              radius='full'
              aria-label={closeLabel}
              // While a write started from the panel is pending, nothing closes it.
              isDisabled={isHeld}
              onPress={close}
            >
              <IconX aria-hidden className={styles.closeIcon()} />
            </IconButton>
          </div>
          <div ref={setContentTarget} className={styles.body()} />
        </div>
      )}
    </aside>
  );
};
