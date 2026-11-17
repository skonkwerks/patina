import { DropZone, type DropZoneProps } from 'react-aria-components';
import { tv } from 'tailwind-variants';

export const dropTargetStyles = tv({
  base: 'rounded outline-offset-2',
  variants: {
    isDropTarget: { true: 'outline-primary outline-2' },
  },
});

export type DropTargetProps = Omit<DropZoneProps, 'className'> & {
  className?: string;
};

/** Compact drop surface whose child supplies its accessible browse action. */
export const DropTarget = ({ className, ...props }: DropTargetProps) => (
  <DropZone
    {...props}
    className={({ isDropTarget }) =>
      dropTargetStyles({ isDropTarget, className })
    }
  />
);
