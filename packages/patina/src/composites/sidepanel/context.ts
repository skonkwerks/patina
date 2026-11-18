import { createContext, use } from 'react';

import type { PanelOpening } from './action.js';
import type { PanelState } from './state.js';

export type SidePanelActions = Readonly<{
  /** Opens the opener's content, or closes the panel when that opener's content is shown. */
  toggle: (opening: PanelOpening) => void;
  /** Shows the opener's content, whatever the panel showed before. */
  open: (opening: PanelOpening) => void;
  /** A person closes the panel, by its close control or Escape. */
  close: () => void;
  /**
   * The opener's content closes itself, as a form does once its write has succeeded;
   * `isOpenerRemoved` says the write removed the control that opened it.
   */
  end: (id: string, isOpenerRemoved: boolean) => void;
  /** The opener's subject is gone from its list. */
  subjectGone: (id: string) => void;
  /** Says whether a write started from the panel's content is pending. */
  hold: (isHeld: boolean) => void;
  /** An opener left the page. */
  unregister: (id: string) => void;
  /** The panel's body element while it is open, which an opener's content is rendered into. */
  setContentTarget: (element: HTMLElement | null) => void;
}>;

export const SidePanelStateContext = createContext<PanelState | null>(null);
export const SidePanelActionsContext = createContext<SidePanelActions | null>(
  null,
);
/** The panel's body element while it is open, or null. */
export const SidePanelTargetContext = createContext<HTMLElement | null>(null);
/** The panel's element id, which an opener names in `aria-controls`. */
export const SidePanelIdContext = createContext<string | null>(null);

const required = <T>(value: T | null, name: string): T => {
  if (value === null) {
    throw new Error(
      `${name} needs a SidePanelProvider (or an AppShell) above it`,
    );
  }
  return value;
};

/** The panel's whole state, with its openers and its focus mechanics: for the family alone. */
export const usePanelState = (): PanelState =>
  required(use(SidePanelStateContext), 'The side panel');

/** What an app may read of the side panel. */
export type SidePanelState = Readonly<{
  /** Whether the panel shows something. */
  isOpen: boolean;
  /** The title of what it shows, its heading; null before anything was shown. */
  title: string | null;
  /** Whether a write started from its content is pending, which keeps it as it is. */
  isHeld: boolean;
}>;

/** What the side panel shows now: whether it is open, its title, and whether a pending write holds it. */
export const useSidePanelState = (): SidePanelState => {
  const { isOpen, title, isHeld } = usePanelState();
  return { isOpen, title, isHeld };
};

export const useSidePanelActions = (): SidePanelActions =>
  required(use(SidePanelActionsContext), 'The side panel');

export const useSidePanelId = (): string =>
  required(use(SidePanelIdContext), 'The side panel');
