import { describe, expect, it } from 'vitest';

import type { PanelOpening, SidePanelAction } from './action.ts';
import { sidePanelReducer } from './reducer.ts';
import { initialPanelState, type PanelState } from './state.ts';

// Stand-ins for the controls that opened the panel: the reducer holds them as data and never reads
// them, so any event target will do where the spec has no DOM.
const helpControl = new EventTarget();
const editControl = new EventTarget();

const opening = (
  id: string,
  token: string,
  trigger: EventTarget = editControl,
): PanelOpening => ({ id, token, title: `Title ${token}`, trigger });

const apply = (state: PanelState, ...actions: SidePanelAction[]) =>
  actions.reduce(sidePanelReducer, state);

const opened = (id: string, token: string, trigger?: EventTarget) =>
  apply(initialPanelState, {
    type: 'OPEN',
    payload: opening(id, token, trigger),
  });

const held = (state: PanelState) =>
  apply(state, { type: 'HOLD', payload: { isHeld: true } });

const end = (id: string): SidePanelAction => ({
  type: 'END',
  payload: { id, isOpenerRemoved: false },
});

describe('sidePanelReducer', () => {
  it('opens an opener’s content with its token and trigger, and the same control closes it', () => {
    const shown = apply(initialPanelState, {
      type: 'TOGGLE',
      payload: opening('help', 'h1', helpControl),
    });
    expect(shown).toEqual({
      activeId: 'help',
      token: 'h1',
      title: 'Title h1',
      trigger: helpControl,
      isOpen: true,
      isHeld: false,
      focusOwed: null,
    });
    expect(
      apply(shown, { type: 'TOGGLE', payload: opening('help', 'h2') }),
    ).toEqual({ ...shown, isOpen: false });
  });

  it('replaces what it shows when another opener opens, without closing', () => {
    expect(
      apply(opened('help', 'h1', helpControl), {
        type: 'TOGGLE',
        payload: opening('edit', 'e1'),
      }),
    ).toEqual({
      activeId: 'edit',
      token: 'e1',
      title: 'Title e1',
      trigger: editControl,
      isOpen: true,
      isHeld: false,
      focusOwed: null,
    });
  });

  it('shows the latest opening of the same opener', () => {
    expect(
      apply(opened('edit', 'e1'), {
        type: 'OPEN',
        payload: opening('edit', 'e2'),
      }).token,
    ).toBe('e2');
  });

  it('closes for a person, and refuses to close what is already closed', () => {
    const closed = apply(opened('edit', 'e1'), { type: 'CLOSE' });
    expect(closed).toEqual({ ...opened('edit', 'e1'), isOpen: false });
    expect(apply(closed, { type: 'CLOSE' })).toBe(closed);
  });

  it('keeps what it shows while held: no toggle, open, close, or subject gone', () => {
    const state = held(opened('edit', 'e1'));
    for (const action of [
      { type: 'OPEN', payload: opening('help', 'h1') },
      { type: 'TOGGLE', payload: opening('edit', 'e2') },
      { type: 'CLOSE' },
      { type: 'SUBJECT_GONE', payload: { id: 'edit' } },
    ] satisfies SidePanelAction[]) {
      expect(apply(state, action)).toBe(state);
    }
  });

  it('lets the shown content end it while held, and the hold ends with it', () => {
    expect(apply(held(opened('edit', 'e1')), end('edit'))).toEqual({
      ...opened('edit', 'e1'),
      isOpen: false,
      isHeld: false,
      focusOwed: null,
    });
  });

  it('closes the same way whether or not the write removed the opener', () => {
    const state = held(opened('edit', 'e1'));
    expect(
      apply(state, {
        type: 'END',
        payload: { id: 'edit', isOpenerRemoved: true },
      }),
    ).toEqual(apply(state, end('edit')));
  });

  it('lets an opener close only its own content', () => {
    const help = opened('help', 'h1', helpControl);
    expect(apply(help, end('edit'))).toBe(help);
    expect(apply(help, { type: 'SUBJECT_GONE', payload: { id: 'edit' } })).toBe(
      help,
    );
    expect(
      apply(help, { type: 'SUBJECT_GONE', payload: { id: 'help' } }).isOpen,
    ).toBe(false);
  });

  it('records a hold, and refuses a hold it already has', () => {
    const state = held(opened('edit', 'e1'));
    expect(state.isHeld).toBe(true);
    expect(held(state)).toBe(state);
  });

  it('closes when the shown opener leaves, and ignores any other leaving', () => {
    const shown = opened('edit', 'e1');
    expect(apply(shown, { type: 'UNREGISTER', payload: { id: 'help' } })).toBe(
      shown,
    );
    expect(
      apply(shown, { type: 'UNREGISTER', payload: { id: 'edit' } }),
    ).toEqual(initialPanelState);
  });

  it('owes the focus until it is given, and refuses to give what is not owed', () => {
    const closed = apply(opened('edit', 'e1'), end('edit'));
    const owed = apply(closed, {
      type: 'OWE_FOCUS',
      payload: { target: null },
    });
    expect(owed.focusOwed).toEqual({ target: null });
    const given = apply(owed, { type: 'FOCUS_GIVEN' });
    expect(given).toEqual(closed);
    expect(apply(given, { type: 'FOCUS_GIVEN' })).toBe(given);
  });
});
