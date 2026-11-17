import {
  DropIndicator as AriaDropIndicator,
  type DropTarget,
} from 'react-aria-components';

/**
 * Where an item will land in a reorder, drawn by the items on either side of React Aria's drop
 * indicator rather than by the indicator itself. The indicator is React Aria's row (it names the
 * insertion point to assistive technology during a keyboard drag), positioned absolutely and zero
 * sized, so it never takes a cell of a tile grid or a place in a list: the items never shift, and a
 * keyboard drag, which renders every indicator at once, leaves no gaps. The items draw the line:
 * the item after a targeted "before" indicator draws it at its start edge, and the last item draws
 * it at its end edge when its "after" indicator is the target (React Aria renders an "after"
 * indicator only after the last item of a level).
 *
 * The line is drawn above the item's content (a tile's picture fills it), as a pseudo-element of the
 * item, so it needs no element of its own.
 *
 * The marker classes `drop-before` and `drop-after` are set here and read only by the
 * `drop-before-target` and `drop-after-target` variants in `patina.css`, which the line classes
 * below use. In a list whose items also take drops, React Aria renders a hidden row before each
 * item during a keyboard drag; the "before" variant looks across it.
 */
export const GridListDropIndicator = ({ target }: { target: DropTarget }) => (
  <AriaDropIndicator
    target={target}
    className={
      target.type === 'item' && target.dropPosition === 'after'
        ? 'drop-after pointer-events-none absolute size-0 overflow-hidden'
        : 'drop-before pointer-events-none absolute size-0 overflow-hidden'
    }
  />
);

/**
 * The shared `renderDropIndicator`: `GridList` supplies it to every `dragAndDropHooks` it is given
 * that has none of its own, so no reorderable list or strip goes without a visible insertion target.
 */
export const renderGridListDropIndicator = (target: DropTarget) => (
  <GridListDropIndicator target={target} />
);

/**
 * A drop onto an item (a row or a tile): a dashed primary outline inside its edge while the drop is
 * over it, with no fill change. Selection never uses an outline or a dash, so the target reads on an
 * unselected and a selected item alike. Defined once here; the row and tile styles apply it.
 */
export const gridListDropTargetOutline =
  'outline-primary outline-2 -outline-offset-4 outline-dashed';

/**
 * The insertion line in a list laid out as a stack of rows: a horizontal primary line at the top
 * edge of the row after the target, or at the bottom edge of the last row.
 */
export const gridListRowDropLine = [
  'drop-before-target:before:bg-primary drop-before-target:before:absolute drop-before-target:before:inset-x-2 drop-before-target:before:top-0 drop-before-target:before:z-10 drop-before-target:before:h-0.5 drop-before-target:before:rounded-full',
  'drop-after-target:after:bg-primary drop-after-target:after:absolute drop-after-target:after:inset-x-2 drop-after-target:after:bottom-0 drop-after-target:after:z-10 drop-after-target:after:h-0.5 drop-after-target:after:rounded-full',
];

/**
 * The insertion line among tiles laid out as a grid or a row: a vertical primary line at the start
 * edge of the tile after the target, or at the end edge of the last tile.
 */
export const gridListTileDropLine = [
  'drop-before-target:before:bg-primary drop-before-target:before:absolute drop-before-target:before:inset-y-2 drop-before-target:before:start-0 drop-before-target:before:z-10 drop-before-target:before:w-0.5 drop-before-target:before:rounded-full',
  'drop-after-target:after:bg-primary drop-after-target:after:absolute drop-after-target:after:inset-y-2 drop-after-target:after:end-0 drop-after-target:after:z-10 drop-after-target:after:w-0.5 drop-after-target:after:rounded-full',
];
