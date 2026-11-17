import type {
  DirectoryDropItem,
  FileDropItem,
  TextDropItem,
} from 'react-aria-components';
import { describe, expect, it } from 'vitest';

import { readDroppedFiles } from './droppedfiles.ts';

/** A dropped file that reads back as `file`. */
const fileItem = (file: File): FileDropItem => ({
  kind: 'file',
  type: file.type,
  name: file.name,
  getFile: () => Promise.resolve(file),
  getText: () => file.text(),
});

/** A dropped file whose contents cannot be read, as when the source is gone. */
const unreadableFileItem = (name: string): FileDropItem => ({
  kind: 'file',
  type: 'image/png',
  name,
  getFile: () => Promise.reject(new Error('the file is gone')),
  getText: () => Promise.reject(new Error('the file is gone')),
});

const textItem: TextDropItem = {
  kind: 'text',
  types: new Set(['text/plain']),
  getText: () => Promise.resolve('dropped words'),
};

const directoryItem: DirectoryDropItem = {
  kind: 'directory',
  name: 'photos',
  getEntries: async function* () {},
};

const photo = new File(['a'], 'photo.png', { type: 'image/png' });
const scan = new File(['b'], 'scan.pdf', { type: 'application/pdf' });

describe('readDroppedFiles', () => {
  it('says a drop holds no files when it is empty', async () => {
    expect(await readDroppedFiles([], true)).toEqual({ failure: 'no-files' });
  });

  it('says a drop holds no files when it holds only text and folders', async () => {
    expect(await readDroppedFiles([textItem, directoryItem], true)).toEqual({
      failure: 'no-files',
    });
  });

  it('gives the one file a single-file drop holds', async () => {
    expect(await readDroppedFiles([fileItem(photo)], false)).toEqual({
      files: [photo],
    });
  });

  it('refuses several files where one is taken', async () => {
    expect(
      await readDroppedFiles([fileItem(photo), fileItem(scan)], false),
    ).toEqual({ failure: 'too-many' });
  });

  it('gives every file, in drop order, where several are taken', async () => {
    expect(
      await readDroppedFiles([fileItem(photo), fileItem(scan)], true),
    ).toEqual({ files: [photo, scan] });
  });

  it('ignores the text and folders beside the files', async () => {
    expect(
      await readDroppedFiles([textItem, fileItem(scan), directoryItem], false),
    ).toEqual({ files: [scan] });
  });

  it('says the drop could not be read when any file fails to read', async () => {
    expect(
      await readDroppedFiles(
        [fileItem(photo), unreadableFileItem('broken.png')],
        true,
      ),
    ).toEqual({ failure: 'read-failed' });
  });
});
