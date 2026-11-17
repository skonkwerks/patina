import type { Ref } from 'react';
import {
  FileTrigger as AriaFileTrigger,
  type FileTriggerProps as AriaFileTriggerProps,
} from 'react-aria-components';

export type FileTriggerProps = AriaFileTriggerProps & {
  /** React 19 ref prop: React Aria's hidden file input, such as for a picker that disables it. */
  ref?: Ref<HTMLInputElement>;
};

/** File picking without prescribing the trigger's appearance. */
export const FileTrigger = (props: FileTriggerProps) => (
  <AriaFileTrigger {...props} />
);
