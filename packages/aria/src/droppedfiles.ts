import { type DropItem, isFileDropItem } from 'react-aria-components';

/** Why a drop gave no files: none in it (text, a link), several where one is taken, or unreadable. */
export type DropFailureReason = 'no-files' | 'too-many' | 'read-failed';

/** The files a drop holds, or why it gave none. Drops are files only. */
export const readDroppedFiles = async (
  items: readonly DropItem[],
  allowsMultiple: boolean,
): Promise<Readonly<{ files: File[] } | { failure: DropFailureReason }>> => {
  const fileItems = items.filter(isFileDropItem);
  if (fileItems.length === 0) {
    return { failure: 'no-files' };
  }
  if (!allowsMultiple && fileItems.length > 1) {
    return { failure: 'too-many' };
  }
  try {
    return {
      files: await Promise.all(fileItems.map((item) => item.getFile())),
    };
  } catch {
    return { failure: 'read-failed' };
  }
};
