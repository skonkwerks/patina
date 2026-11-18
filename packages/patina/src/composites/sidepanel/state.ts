/**
 * What the side panel shows, who opened it, and where the focus goes when it closes: the family's
 * own state. An app reads the part it may rely on through `useSidePanelState`.
 */
export type PanelState = Readonly<{
  /** The id of the opener (a `useSidePanel` caller) whose content the panel shows. */
  activeId: string | null;
  /** The token of that opener's accepted opening: which of its surfaces the panel shows. */
  token: string | null;
  /** The title of what it shows: the panel's heading and accessible name. */
  title: string | null;
  /**
   * The control that opened what the panel shows, which the focus returns to when it closes. An
   * element held as data: the reducer stores it and never reads or changes it.
   */
  trigger: EventTarget | null;
  isOpen: boolean;
  /**
   * Whether a write started from the panel's content is pending. While it is, nothing but that
   * content closes the panel or replaces what it shows, so the write's outcome lands where it was
   * started. What a hold refuses is decided in `sidePanelReducer` alone.
   */
  isHeld: boolean;
  /**
   * Where the focus is still to go after a closing that could not give it at once, because a modal
   * opened from the panel's content made the page inert until it leaves: to `target`, or to the
   * page's heading when it is null. Null when nothing is owed.
   */
  focusOwed: Readonly<{ target: EventTarget | null }> | null;
}>;

export const initialPanelState: PanelState = {
  activeId: null,
  token: null,
  title: null,
  trigger: null,
  isOpen: false,
  isHeld: false,
  focusOwed: null,
};
