/*
 * For stories only; not shipped (`package.json` `files` leaves out `*.testing.ts` and `*.testing.tsx`).
 *
 * React Aria announces a pending control, and the opening of a modal, through its live announcer:
 * a transient node labelled by the control or the dialog's title. When that labelled element is
 * removed (a pending button whose read or save has ended, a dialog that closed), the node points at
 * nothing until React Aria clears it, and axe reports it, in that story and in the next one, since
 * the announcer is shared by the document. A story that removes such an element waits for the clear
 * before it ends.
 *
 * This relies on React Aria's implementation, not its documented API: the `[data-live-announcer]`
 * container, its labelled child, and its 7-second clear (react-aria 3.53.1). Check it again on every
 * React Aria upgrade: if a wait fails or nears its timeout, the announcer changed.
 */

/** A labelled message React Aria's live announcer still holds. */
export const LIVE_ANNOUNCER_MESSAGE = '[data-live-announcer] [aria-labelledby]';

/** Longer than React Aria's live announcer keeps a message (7 seconds in react-aria 3.53.1). */
export const LIVE_ANNOUNCER_CLEAR_MS = 10_000;
