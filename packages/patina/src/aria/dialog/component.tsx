import { IconX } from '@tabler/icons-react';
import { type ReactNode, use } from 'react';
import {
  Dialog as AriaDialog,
  type DialogProps as AriaDialogProps,
  Heading,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { IconButton } from '../iconbutton/index.js';
import { DialogPlacementContext, DismissDisabledContext } from './context.js';

export const dialogStyles = tv({
  slots: {
    overlay: 'bg-scrim fixed inset-0 z-50 flex',
    modal:
      'bg-overlay border-overlay-border text-overlay-foreground w-full max-w-md border shadow-xl outline-0',
    dialog: 'flex flex-col outline-0',
    header: 'flex shrink-0 items-start justify-between gap-3',
    // The rest of the dialog's height under the header, when the dialog has a set height (the modal
    // drawer, or a viewer whose call site sets one); as high as its content otherwise.
    body: 'flex min-h-0 flex-1 flex-col gap-4',
    heading: 'min-w-0',
    titleRow: 'flex items-center gap-2',
    title: 'text-overlay-foreground text-lg font-semibold',
    description: 'text-overlay-foreground-muted text-sm',
    headerActions: '-mt-1 -mr-1 flex shrink-0 items-center gap-1',
    closeIcon: 'h-4 w-4',
  },
  variants: {
    // Where the modal stands. Centered (the default), as large as its content needs up to 90% of
    // the window, the whole dialog scrolling past that. The modal drawer: the window's full height
    // at the right edge, with its title and close control fixed over a body that scrolls.
    placement: {
      center: {
        overlay: 'items-center justify-center p-4',
        modal: 'max-h-[90vh] overflow-y-auto rounded-lg',
        dialog: 'gap-4 p-5',
      },
      right: {
        overlay: 'items-stretch justify-end',
        modal:
          'flex h-full max-h-full flex-col overflow-hidden border-y-0 border-e-0',
        dialog: 'min-h-0 flex-1',
        header: 'border-overlay-border border-b p-5',
        body: 'overflow-y-auto p-5',
      },
    },
  },
  defaultVariants: { placement: 'center' },
});

/** Connects a modal to its opener so React Aria owns focus restoration and trigger semantics. */
export { DialogTrigger } from 'react-aria-components';

export type DialogProps = Omit<AriaDialogProps, 'className'> & {
  /** The dialog's title, rendered as its accessible name. */
  title: string;
  /** One short line under the title, as a page header has: when it started, what it belongs to. */
  description?: string;
  /** Accessible name of the icon-only close control, such as the vocabulary's word for Close. */
  closeLabel: string;
  /** What sits in the header between the title and the close control, such as a viewer's place in its set. */
  headerContent?: ReactNode;
  /** Controls beside the close control, before it, such as a viewer's Full screen. */
  headerActions?: ReactNode;
  className?: string;
};

/** A dialog's content: title plus children, on an overlay surface. Use inside `DialogModal`. */
export const Dialog = ({
  title,
  description,
  closeLabel,
  headerContent,
  headerActions,
  className,
  children,
  ...rest
}: DialogProps) => {
  const isDismissDisabled = use(DismissDisabledContext);
  const styles = dialogStyles({ placement: use(DialogPlacementContext) });
  return (
    <AriaDialog {...rest} className={styles.dialog({ className })}>
      {(renderProps) => (
        <>
          <div className={styles.header()}>
            <div className={styles.heading()}>
              <div className={styles.titleRow()}>
                <Heading slot='title' className={styles.title()}>
                  {title}
                </Heading>
              </div>
              {description && (
                <p className={styles.description()}>{description}</p>
              )}
            </div>
            {headerContent}
            <div className={styles.headerActions()}>
              {headerActions}
              <IconButton
                size='sm'
                radius='full'
                aria-label={closeLabel}
                onPress={renderProps.close}
                isDisabled={isDismissDisabled}
              >
                <IconX aria-hidden className={styles.closeIcon()} />
              </IconButton>
            </div>
          </div>
          <div className={styles.body()}>
            {typeof children === 'function' ? children(renderProps) : children}
          </div>
        </>
      )}
    </AriaDialog>
  );
};
