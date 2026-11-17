import { DropZone, type DropZoneProps } from 'react-aria-components';
import { tv } from 'tailwind-variants';

export const dropTargetStyles = tv({
  base: 'rounded outline-offset-2',
  variants: {
    isDropTarget: { true: 'outline-primary outline-2' },
  },
});

/** Compact drop surface whose child supplies its accessible browse action. */
export const DropTarget = ({
  className,
  ...props
}: Omit<DropZoneProps, 'className'> & { className?: string }) => (
  <DropZone
    {...props}
    className={({ isDropTarget }) =>
      dropTargetStyles({ isDropTarget, className })
    }
  />
);
