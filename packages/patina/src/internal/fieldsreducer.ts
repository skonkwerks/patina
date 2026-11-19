import { produce } from 'immer';

/**
 * One field of a form's state takes a value: `{ type: 'SET', payload: { field, value } }`. The
 * value is held to the type of its field, for a field named by a variable too.
 */
type FieldsAction<State extends object> = {
  [Field in keyof State]-?: {
    type: 'SET';
    payload: { field: Field; value: State[Field] };
  };
}[keyof State];

/**
 * The one reducer of every form whose only transition is that a field takes a value
 * (`react/state.md`, "Forms"). Such a form keeps its own state type and default factory beside it
 * and calls `useReducer(fieldsReducer<State>, undefined, defaultState)`. It has the one action, so
 * there is nothing for it to switch on. A form in which one field changes another has transitions,
 * and a reducer, of its own.
 */
export const fieldsReducer = <State extends object>(
  state: State,
  { payload: { field, value } }: FieldsAction<State>,
): State =>
  // The draft is typed as the state, which Immer's `produce` allows, so the write is checked: its
  // own draft type can't be indexed by a field of a state of any type.
  produce<State, State>(state, (draft) => {
    draft[field] = value;
  });
