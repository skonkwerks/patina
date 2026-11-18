import type { ReactNode } from 'react';
import {
  ButtonContext,
  FieldInputContext,
  GroupContext,
  InputContext,
  LabelContext,
  Provider,
  TextContext,
} from 'react-aria-components';

/**
 * Where a field's `info` slot begins, the field's own contexts end. A React Aria field gives its
 * parts to the controls inside it through context: a select's trigger, a search field's clear
 * control, a date picker's calendar button and a number field's steppers all take `ButtonContext`
 * (the number field's with named slots, so a button without one throws), and every field names its
 * label and its description through `LabelContext` and `TextContext`. The `info` control stands
 * inside the field but is not one of its parts, so without this an `InfoButton` there would become
 * the field's trigger or clear control, and a label or a text in the help it opens would take the
 * field's. The contexts cleared are the ones React Aria itself clears in the popovers its select,
 * combo box and date picker open from inside the field; a field that comes to give another context
 * to its children is checked against this list.
 */
export const FieldContextBoundary = ({ children }: { children: ReactNode }) => (
  <Provider
    values={[
      [ButtonContext, null],
      [FieldInputContext, null],
      [GroupContext, null],
      [InputContext, null],
      [LabelContext, null],
      [TextContext, null],
    ]}
  >
    {children}
  </Provider>
);
