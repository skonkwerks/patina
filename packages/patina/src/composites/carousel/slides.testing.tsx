/*
 * For stories only; not shipped (`package.json` `files` leaves out `*.testing.tsx`).
 *
 * The placeholder slides of the carousel's and the media viewer's stories (`pictures.testing.ts`):
 * a picture whole inside the frame, or a stand-in video, and a picture's thumbnail.
 */
import { type Picture, pictureSource } from './pictures.testing.ts';

/** A slide: the picture whole inside the frame, or the stand-in video's player filling it. */
export const PictureSlide = ({ picture }: { picture: Picture }) =>
  picture.isVideo ? (
    // The browser's own player, with nothing to play: it takes the focus and keeps the arrow keys,
    // as a real video's player does.
    <video controls aria-label={picture.title} className='size-full'>
      <track kind='captions' />
    </video>
  ) : (
    <img
      alt={picture.title}
      src={pictureSource(picture)}
      className='size-full object-contain'
    />
  );

/** A picture's thumbnail, filling the scrubber's preview square; its words are beside it. */
export const PictureThumbnail = ({ picture }: { picture: Picture }) => (
  <img alt='' src={pictureSource(picture)} className='size-full object-cover' />
);
