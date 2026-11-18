import { produce } from 'immer';

import type { SidePanelAction } from './action.ts';
import { initialPanelState, type PanelState } from './state.ts';

/**
 * The side panel's rules, in one place: one thing shown at a time; the opener's control closes what
 * it opened; an opener closes only its own content; and a held panel keeps what it shows until its
 * content ends it. An action the rules refuse returns the same state, which is how the provider
 * knows it was refused: a refusal returns `state` itself, and `produce` returns it too when its
 * recipe changes nothing.
 */
export const sidePanelReducer = (
  state: PanelState,
  action: SidePanelAction,
): PanelState => {
  const isShown = (id: string) => state.isOpen && state.activeId === id;
  switch (action.type) {
    case 'TOGGLE':
    case 'OPEN': {
      if (state.isHeld) {
        return state;
      }
      // The control that opened the panel closes it; another control replaces its content.
      if (action.type === 'TOGGLE' && isShown(action.payload.id)) {
        return produce(state, (draft) => {
          draft.isOpen = false;
        });
      }
      const { id, token, title, trigger } = action.payload;
      return produce(state, (draft) => {
        draft.activeId = id;
        draft.token = token;
        draft.title = title;
        draft.trigger = trigger;
        draft.isOpen = true;
      });
    }
    case 'CLOSE':
      if (state.isHeld || !state.isOpen) {
        return state;
      }
      return produce(state, (draft) => {
        draft.isOpen = false;
      });
    case 'END':
      // The content that holds the panel may end it: its write is done.
      if (!isShown(action.payload.id)) {
        return state;
      }
      return produce(state, (draft) => {
        draft.isOpen = false;
        draft.isHeld = false;
      });
    case 'SUBJECT_GONE':
      // A form with a pending write stays until its write ends.
      if (state.isHeld || !isShown(action.payload.id)) {
        return state;
      }
      return produce(state, (draft) => {
        draft.isOpen = false;
      });
    case 'HOLD':
      return produce(state, (draft) => {
        draft.isHeld = action.payload.isHeld;
      });
    case 'UNREGISTER':
      // Only the shown opener leaving closes the panel; any other is not shown.
      if (state.activeId !== action.payload.id) {
        return state;
      }
      return initialPanelState;
    case 'OWE_FOCUS':
      return produce(state, (draft) => {
        draft.focusOwed = action.payload;
      });
    case 'FOCUS_GIVEN':
      return produce(state, (draft) => {
        draft.focusOwed = null;
      });
    default:
      return state;
  }
};
