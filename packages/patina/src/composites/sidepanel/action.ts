/**
 * An opener's opening: its id, the token of this opening (which of the opener's surfaces it shows),
 * the title of what it shows (the panel's heading and accessible name), and the control that opened
 * it, which the focus returns to.
 */
export type PanelOpening = Readonly<{
  id: string;
  token: string;
  title: string;
  trigger: EventTarget | null;
}>;

/** An opener, by its id (a `useSidePanel` caller). */
type Opener = Readonly<{ id: string }>;

export type SidePanelAction =
  /** The opener's control: opens its content, or closes the panel when its content is shown. */
  | Readonly<{ type: 'TOGGLE'; payload: PanelOpening }>
  /** Shows the opener's content whatever the panel showed before, as an edit opened for another item does. */
  | Readonly<{ type: 'OPEN'; payload: PanelOpening }>
  /** A person closes the panel: its close control, or Escape. */
  | Readonly<{ type: 'CLOSE' }>
  /**
   * The opener's content closes itself, as a form does once its write has succeeded.
   * `isOpenerRemoved` says the write removed the control that opened it, so the focus goes to the
   * page's heading; where the focus goes is the provider's, and the reducer only closes.
   */
  | Readonly<{
      type: 'END';
      payload: Readonly<{ id: string; isOpenerRemoved: boolean }>;
    }>
  /** The opener's subject is gone from its list, removed here or elsewhere. */
  | Readonly<{ type: 'SUBJECT_GONE'; payload: Opener }>
  /** A write started from the panel's content began or ended. */
  | Readonly<{ type: 'HOLD'; payload: Readonly<{ isHeld: boolean }> }>
  /** An opener left the page. */
  | Readonly<{ type: 'UNREGISTER'; payload: Opener }>
  /**
   * A closing could not give the focus back yet: a modal opened from the panel's content made the
   * page inert. `target` is where it goes once the page is usable again, or the page's heading when
   * null.
   */
  | Readonly<{
      type: 'OWE_FOCUS';
      payload: Readonly<{ target: EventTarget | null }>;
    }>
  /** The owed focus was given. */
  | Readonly<{ type: 'FOCUS_GIVEN' }>;
