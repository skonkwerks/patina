import type { ReactNode, Ref } from 'react';
import {
  composeRenderProps,
  GridList as AriaGridList,
  type GridListProps as AriaGridListProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { EmptyState, type EmptyStateProps } from '../emptystate.tsx';
import { PendingStatus } from '../spinner.tsx';
import type { FileDrop } from '../usefiledrop.ts';

/** The frame around the grid: where the error notice stands, and the pending status inside the grid. */
export const gridListFrameStyles = tv({
  slots: {
    root: 'flex min-h-0 flex-col gap-3',
    pending: 'text-surface-foreground-muted p-4',
  },
});

/** The grid itself. */
export const gridListStyles = tv({
  base: 'bg-surface rounded-lg p-0 outline-0',
  variants: {
    // A list that takes files has a dashed frame while it takes them. The frame is two pixels
    // whether or not the drop is enabled, so enabling it never moves the items.
    fileDrop: {
      none: 'border-surface-border border',
      enabled: 'border-surface-border border-2 border-dashed',
      disabled: 'border-surface-border border-2',
    },
    isDropTarget: { true: '', false: '' },
  },
  compoundVariants: [
    {
      fileDrop: 'enabled',
      isDropTarget: true,
      class: 'border-primary bg-primary/10',
    },
    // A list whose whole frame is the drop target (dragged items over its empty space, such as
    // results dropped onto the candidates) is ringed; a drop between items draws the insertion
    // line instead.
    {
      fileDrop: 'none',
      isDropTarget: true,
      class: 'border-primary ring-primary ring-1',
    },
  ],
});

const fileDropVariant = (fileDrop: FileDrop | undefined) => {
  if (!fileDrop) {
    return 'none';
  }
  return fileDrop.isDisabled ? 'disabled' : 'enabled';
};

export type GridListProps<T extends object> = AriaGridListProps<T> &
  // RAC forwards this native Stately option but omits it from its public props.
  // Repeated clicks must publish a new range anchor even when the keys match.
  {
    /**
     * Publish a selection change even when the selected keys are the same, so repeated clicks
     * move a range anchor. React Stately's option, typed here so the package needs no import of it.
     */
    allowDuplicateSelectionEvents?: boolean;
    /** What the list shows when it loaded and has no items: the `EmptyState` control's props. */
    emptyState: EmptyStateProps;
    /**
     * A failed load or refresh, shown above the list: the app renders the notice (such as a
     * `LoadFailure` with a retry), since an error notice is not a React Aria wrapper. With no items the body stays
     * empty instead of claiming there is nothing; with cached items they stay on screen.
     */
    error?: ReactNode;
    /** React 19 ref prop: the grid element, such as for a caller that scrolls it. */
    ref?: Ref<HTMLDivElement>;
  } & (
    | { isPending?: false; pendingText?: undefined }
    | {
        /** While the first load is in flight, the list shows `pendingText` instead of the empty state. */
        isPending: boolean;
        pendingText: string;
      }
  ) &
  (
    | { fileDrop?: undefined }
    | {
        /**
         * Files dropped on the list as a whole, from `useFileDrop`, in place of `dragAndDropHooks`.
         * The list keeps the drop's hooks while it is disabled, and draws the dashed frame of a list
         * that takes files only while it is enabled.
         */
        fileDrop: FileDrop;
        dragAndDropHooks?: undefined;
      }
  );

/**
 * The project's list of units: React Aria grid semantics (one Tab stop, arrow keys between items,
 * selection when enabled) with token styling. Items are `GridListItem`s, usually one file each. The
 * list is always rendered; loading and empty are states of its body, and a failed load or refresh
 * shows above it, so its frame never changes. Empty is shown only after a load that succeeded with
 * no items. A list given `fileDrop` takes files dropped on it, with the frame that says so.
 * `className` styles the grid itself; size and place the whole control from its parent.
 */
export const GridList = <T extends object>({
  children,
  emptyState,
  error,
  isPending = false,
  pendingText,
  fileDrop,
  ...props
}: GridListProps<T>) => {
  const frame = gridListFrameStyles();
  return (
    <div className={frame.root()}>
      {/* A failed load shows above the list in every case: over an empty body after a failed first
        load, and over the cached items after a failed refresh, which stay usable. Retry is outside
        the grid, so it is an ordinary Tab stop. */}
      {error}
      <AriaGridList
        {...props}
        {...(fileDrop ? { dragAndDropHooks: fileDrop.hooks } : {})}
        className={composeRenderProps(props.className, (cls, renderProps) =>
          gridListStyles({
            fileDrop: fileDropVariant(fileDrop),
            isDropTarget: renderProps.isDropTarget,
            className: cls,
          }),
        )}
        renderEmptyState={() =>
          // The props give the text whenever the list is pending; destructuring loses that pairing.
          isPending && pendingText !== undefined ? (
            <PendingStatus text={pendingText} className={frame.pending()} />
          ) : error ? null : (
            <EmptyState {...emptyState} />
          )
        }
      >
        {children}
      </AriaGridList>
    </div>
  );
};
