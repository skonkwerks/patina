import {
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useReducer,
  useState,
} from 'react';

import { focusPageHeading } from '../../header/index.ts';
import type { SidePanelAction } from './action.ts';
import {
  type SidePanelActions,
  SidePanelActionsContext,
  SidePanelIdContext,
  SidePanelStateContext,
  SidePanelTargetContext,
} from './context.ts';
import { sidePanelReducer } from './reducer.ts';
import { initialPanelState } from './state.ts';

/**
 * Whether the focus is on the page outside the panel. Before a closing, that means the person is
 * elsewhere on the page, where a panel closing beside them leaves the focus; after a closing gave
 * the focus, that it landed. A modal opened from the panel's content, such as a confirmation, stands
 * outside the page, so the focus in it counts as the panel's.
 */
const isFocusOnPage = (panel: HTMLElement | null) => {
  const active = document.activeElement;
  return Boolean(
    active && panel?.parentElement?.contains(active) && !panel.contains(active),
  );
};

/**
 * Gives the focus to the control that opened what the panel showed, or to the page's heading when
 * there is none to give it to: the opener is gone, or the panel's own write removed it (`opener` is
 * then null).
 */
const giveFocus = (opener: EventTarget | null) => {
  if (opener instanceof HTMLElement && opener.isConnected) {
    opener.focus();
  } else {
    focusPageHeading();
  }
};

export type SidePanelProviderProps = { children: ReactNode };

/**
 * The side panel's state, above the shell and its pages: what the panel shows, the control the
 * focus returns to when it closes, and the element an opener's content is rendered into. `AppShell`
 * renders it; a custom shell renders it once, above its `SidePanel` and its pages, with the
 * `SidePanel` a child of the element that holds the page.
 */
export const SidePanelProvider = ({ children }: SidePanelProviderProps) => {
  const [state, dispatch] = useReducer(sidePanelReducer, initialPanelState);
  const panelId = useId();
  const [contentTarget, setContentTarget] = useState<HTMLElement | null>(null);

  // The actions an effect names, which need no answer, are made once, so such an effect does not
  // run again whenever the panel changes.
  const stable = useMemo(
    () =>
      ({
        hold: (isHeld: boolean) =>
          dispatch({ type: 'HOLD', payload: { isHeld } }),
        unregister: (id: string) =>
          dispatch({ type: 'UNREGISTER', payload: { id } }),
        setContentTarget,
      }) satisfies Pick<
        SidePanelActions,
        'hold' | 'unregister' | 'setContentTarget'
      >,
    [],
  );

  // A closing gives the focus back in the same call, while the panel's content still holds it, so
  // it never falls to the document; unless the person is elsewhere on the page. Whether a closing
  // takes effect is the reducer's answer, asked of the state this render holds; the reducer answers
  // again, the same way, when React applies the action. While a modal opened from the content is
  // open, React Aria keeps the page inert and nothing on it takes the focus: the closing then owes
  // the focus, and gives it once the modal has left with the content (below).
  const closing = (action: SidePanelAction, isOpenerRemoved = false) => {
    if (sidePanelReducer(state, action) === state) {
      return;
    }
    const panel = document.getElementById(panelId);
    const target = isOpenerRemoved ? null : state.trigger;
    if (!isFocusOnPage(panel)) {
      giveFocus(target);
      if (!isFocusOnPage(panel)) {
        dispatch({ type: 'OWE_FOCUS', payload: { target } });
      }
    }
    dispatch(action);
  };

  // React Aria lets go of the page once the modal's own effects are cleaned up, which happens
  // before this effect runs in the commit that removed the modal.
  const { focusOwed } = state;
  useEffect(() => {
    if (focusOwed !== null) {
      giveFocus(focusOwed.target);
      dispatch({ type: 'FOCUS_GIVEN' });
    }
  }, [focusOwed]);

  const actions: SidePanelActions = {
    ...stable,
    toggle: (opening) => dispatch({ type: 'TOGGLE', payload: opening }),
    open: (opening) => dispatch({ type: 'OPEN', payload: opening }),
    close: () => closing({ type: 'CLOSE' }),
    end: (id, isOpenerRemoved) =>
      closing(
        { type: 'END', payload: { id, isOpenerRemoved } },
        isOpenerRemoved,
      ),
    subjectGone: (id) => closing({ type: 'SUBJECT_GONE', payload: { id } }),
  };

  return (
    <SidePanelIdContext value={panelId}>
      <SidePanelActionsContext value={actions}>
        <SidePanelStateContext value={state}>
          <SidePanelTargetContext value={contentTarget}>
            {children}
          </SidePanelTargetContext>
        </SidePanelStateContext>
      </SidePanelActionsContext>
    </SidePanelIdContext>
  );
};
