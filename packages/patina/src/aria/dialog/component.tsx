import { IconX } from '@tabler/icons-react';
import { type ReactNode, use } from 'react';
import {
  Dialog as AriaDialog,
  type DialogProps as AriaDialogProps,
  Heading,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { IconButton } from '../iconbutton/index.ts';
import { DismissDisabledContext } from './context.ts';

export const dialogStyles = tv({
  slots: {
    overlay: 'bg-scrim fixed inset-0 z-50 flex items-center justify-center p-4',
    modal:
      'bg-overlay border-overlay-border text-overlay-foreground max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border shadow-xl outline-0',
    dialog: 'flex flex-col gap-4 p-5 outline-0',
    header: 'flex items-start justify-between gap-3',
    heading: 'min-w-0',
    titleRow: 'flex items-center gap-2',
    title: 'text-overlay-foreground text-lg font-semibold',
    description: 'text-overlay-foreground-muted text-sm',
    headerActions: '-mt-1 -mr-1 flex shrink-0 items-center gap-1',
    closeIcon: 'h-4 w-4',
  },
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
  const styles = dialogStyles();
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
          {typeof children === 'function' ? children(renderProps) : children}
        </>
      )}
    </AriaDialog>
  );
};
