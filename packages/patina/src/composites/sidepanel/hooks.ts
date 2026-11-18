import { type ReactNode, use, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import type { PanelOpening } from './action.js';
import {
  SidePanelTargetContext,
  usePanelState,
  useSidePanelActions,
  useSidePanelId,
} from './context.js';

/** How content is shown in the side panel: its title, and the control the focus returns to when it closes. */
export type SidePanelOpening = Readonly<{
  title: string;
  trigger: Element | null;
}>;

/** How the panel's content closes it. */
export type SidePanelClosing = Readonly<{
  /** The write that closes the panel removed the control that opened it. */
  isOpenerRemoved?: boolean;
}>;

/**
 * An opener's hold on the shell's one side panel, for a page's help, an item's details, or the
 * form that adds or edits one item. The panel shows one thing at a time; opening it here replaces
 * what it showed.
 *
 * `Surface` is what this opener shows: the item a form is about, which of its forms, or just
 * `true` for help. `surface` is what the panel shows for this opener now, and null whenever it
 * shows nothing of this opener: before it was opened, once it was closed, and while it shows
 * another opener's content. `open` shows a surface; `toggle` does the same, or closes the panel when
 * this opener's content is shown (a help control's press); `close` closes it from the content, as a
 * form does once its write has succeeded. `render` places the content into the panel while it shows
 * this opener's surface; the content stays in the caller's tree, so it reads the same state and
 * providers and updates while open. Unmounting the caller closes the panel if it showed its content.
 */
export const useSidePanel = <Surface extends NonNullable<unknown>>() => {
  const id = useId();
  const { activeId, token, isOpen } = usePanelState();
  const actions = useSidePanelActions();
  const { unregister } = actions;
  const panelId = useSidePanelId();
  const target = use(SidePanelTargetContext);
  // Each opening is a token, so the panel's state names which surface it shows: a refused opening
  // leaves the surface it shows, and a stale one is never shown. A counter, not a copy of state.
  const openings = useRef(0);
  // The surfaces of this opener's openings by token: the one shown and the latest asked for.
  const [surfaces, setSurfaces] = useState<ReadonlyMap<string, Surface>>(
    () => new Map(),
  );
  const isShowing = isOpen && activeId === id;
  const shownToken = activeId === id ? token : null;

  useEffect(() => () => unregister(id), [unregister, id]);

  const ask = (
    show: (opening: PanelOpening) => void,
    surface: Surface,
    { title, trigger }: SidePanelOpening,
  ) => {
    openings.current += 1;
    const opening = {
      id,
      token: `${id}:${String(openings.current)}`,
      title,
      trigger,
    };
    setSurfaces((current) => {
      const kept = new Map<string, Surface>();
      const shown = shownToken === null ? undefined : current.get(shownToken);
      if (shownToken !== null && shown !== undefined) {
        kept.set(shownToken, shown);
      }
      return kept.set(opening.token, surface);
    });
    show(opening);
  };

  return {
    surface: isShowing && token !== null ? (surfaces.get(token) ?? null) : null,
    /** Whether the panel shows this opener's content: an opener's control says so with `aria-expanded`. */
    isShowing,
    /** The panel's id, which an opener's control names in `aria-controls`. */
    panelId,
    /** This opener's id in the panel, by which `useCloseSidePanelWhenGone` closes only its content. */
    openerId: id,
    /** Shows a surface. A held panel keeps what it shows. */
    open: (surface: Surface, showing: SidePanelOpening) =>
      ask(actions.open, surface, showing),
    /** Shows a surface, or closes the panel when this opener's content is shown. */
    toggle: (surface: Surface, showing: SidePanelOpening) =>
      ask(actions.toggle, surface, showing),
    /**
     * Closes the panel from its own content, and only while it shows this opener's content. A
     * pending write's hold ends with it: the hold keeps a person and other openers from closing the
     * panel under the write, not the content from closing it once the write is done. Pass
     * `isOpenerRemoved` when the write removed the control that opened the panel (a Remove in the
     * panel's form): the focus then goes to the page's heading, even if that control leaves the
     * page only later, once its list is read again.
     */
    close: ({ isOpenerRemoved = false }: SidePanelClosing = {}) =>
      actions.end(id, isOpenerRemoved),
    render: (content: ReactNode) =>
      isShowing && target ? createPortal(content, target) : null,
  };
};

/**
 * Keeps the panel as it is while a write started from its content is pending: nothing but that
 * content closes it or shows something else in it, so the outcome lands in the form that started
 * the write.
 */
export const useSidePanelHold = (isPending: boolean) => {
  const { hold } = useSidePanelActions();
  useEffect(() => {
    hold(isPending);
    return () => hold(false);
  }, [hold, isPending]);
};

/**
 * Closes the panel when the subject this opener shows in it is gone from its list, removed here or
 * elsewhere; while the panel shows another opener's content, it does nothing. `isGone` is true once
 * the list was read and does not hold the subject; for a list read a page at a time, once every
 * page was read and none holds it. A form with a pending write stays until its write ends.
 */
export const useCloseSidePanelWhenGone = (
  panel: Readonly<{ openerId: string; isShowing: boolean }>,
  isGone: boolean,
) => {
  // `subjectGone` is made anew whenever the panel changes, so this runs again when a hold ends;
  // whether the panel closes is the reducer's rule.
  const { subjectGone } = useSidePanelActions();
  const { openerId, isShowing } = panel;
  useEffect(() => {
    if (isGone && isShowing) {
      subjectGone(openerId);
    }
  }, [isGone, isShowing, subjectGone, openerId]);
};
