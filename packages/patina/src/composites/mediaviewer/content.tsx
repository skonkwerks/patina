import { IconArrowsMaximize, IconArrowsMinimize } from '@tabler/icons-react';
import { useState } from 'react';
import type { Key } from 'react-aria-components';

import { Dialog } from '../../aria/dialog/index.ts';
import { IconToggle } from '../../aria/togglegroup/index.ts';
import {
  type CarouselItem,
  useCarouselKeyboard,
  useCarouselState,
} from '../carousel/index.ts';
import { MediaViewer, type MediaViewerContentProps } from './component.tsx';
import { mediaViewerDialogStyles } from './styles.ts';

type ContentProps<T extends CarouselItem> = MediaViewerContentProps<T> & {
  items: readonly T[];
  defaultCurrentId?: Key;
  title: string;
  closeLabel: string;
  fullScreenLabel: string;
};

/**
 * A sidecar of `MediaViewerDialog`, private to the media viewer family: what the dialog holds while
 * it is open. It is mounted each time the dialog opens, so where the viewer is starts from the
 * slide it was opened on, and full screen starts off. The dialog's element says while it is in full
 * screen (`data-full-screen`), which the modal around it fills the window for. That element takes
 * the arrow keys, so they turn the viewer while the focus is anywhere in the dialog: on the dialog
 * itself as it opens, on full screen or the close control, on an action; not in a control that
 * uses them. The viewer is a group named by the dialog's title, which already names the dialog.
 */
const C = <T extends CarouselItem>({
  items,
  defaultCurrentId,
  title,
  closeLabel,
  fullScreenLabel,
  ...viewer
}: ContentProps<T>) => {
  const state = useCarouselState({ items, defaultCurrentId });
  const keyboard = useCarouselKeyboard(state);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const styles = mediaViewerDialogStyles();
  return (
    <Dialog
      title={title}
      closeLabel={closeLabel}
      headerActions={
        <IconToggle
          size='sm'
          aria-label={fullScreenLabel}
          isSelected={isFullScreen}
          onChange={setIsFullScreen}
        >
          {({ isSelected }) =>
            isSelected ? (
              <IconArrowsMinimize
                aria-hidden
                className={styles.fullScreenIcon()}
              />
            ) : (
              <IconArrowsMaximize
                aria-hidden
                className={styles.fullScreenIcon()}
              />
            )
          }
        </IconToggle>
      }
      className={styles.dialog()}
      // React Aria's dialog passes on pointer events but not keyboard ones, so the keys go on its
      // own element through its documented `render`, which draws that element.
      render={(props) => (
        <section
          {...props}
          data-full-screen={isFullScreen || undefined}
          onKeyDown={(event) => {
            props.onKeyDown?.(event);
            keyboard.onKeyDown(event);
          }}
        />
      )}
    >
      <MediaViewer
        {...viewer}
        state={state}
        aria-label={title}
        role='group'
        className={styles.viewer()}
      />
    </Dialog>
  );
};

C.displayName = 'MediaViewerDialogContent';
export default C;
