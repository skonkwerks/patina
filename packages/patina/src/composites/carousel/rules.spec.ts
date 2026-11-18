import { describe, expect, it } from 'vitest';

import {
  arrowStep,
  clampIndex,
  currentIndex,
  dragBounds,
  followedPlace,
  indicatorKind,
  openingPlace,
  placeAt,
  scrubberFraction,
  scrubberPosition,
  stripPosition,
  swipeIndex,
  turnedPlace,
  turnStart,
  usesArrowKeys,
} from './rules.js';

const element = (localName: string, type?: string) => ({
  localName,
  type,
  isContentEditable: false,
});

const press = (
  key: string,
  extra: Partial<Parameters<typeof arrowStep>[0]> = {},
) => ({
  key,
  defaultPrevented: false,
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
  target: element('button'),
  ...extra,
});

describe('indicatorKind', () => {
  it('has nothing to show for fewer than two slides', () => {
    expect(indicatorKind(0)).toBe('none');
    expect(indicatorKind(1)).toBe('none');
  });

  it('has dots up to nine slides and a scrubber past nine', () => {
    expect(indicatorKind(2)).toBe('dots');
    expect(indicatorKind(9)).toBe('dots');
    expect(indicatorKind(10)).toBe('scrubber');
  });
});

describe('clampIndex', () => {
  it('keeps an index inside the set', () => {
    expect(clampIndex(-1, 3)).toBe(0);
    expect(clampIndex(5, 3)).toBe(2);
    expect(clampIndex(1, 3)).toBe(1);
    expect(clampIndex(4, 0)).toBe(0);
  });
});

/** A slide the carousel is on, at `index`. */
const on = (id: string | number | undefined, index: number) => ({
  id,
  index,
  isAwaited: false,
});

describe('placeAt', () => {
  it('is the place of the slide there, kept inside the set', () => {
    expect(placeAt(['a', 'b', 'c'], 1)).toEqual(on('b', 1));
    expect(placeAt(['a', 'b', 'c'], 7)).toEqual(on('c', 2));
    expect(placeAt([], 3)).toEqual(on(undefined, 0));
  });
});

describe('openingPlace', () => {
  it('opens on the slide named, or on the first', () => {
    expect(openingPlace(['a', 'b', 'c'], 'b')).toEqual(on('b', 1));
    expect(openingPlace(['a', 'b', 'c'], undefined)).toEqual(on('a', 0));
    expect(openingPlace([], undefined)).toEqual(on(undefined, 0));
  });

  it('awaits a slide the set does not hold yet, empty or not, on the first meanwhile', () => {
    expect(openingPlace([], 'c')).toEqual({
      id: 'c',
      index: 0,
      isAwaited: true,
    });
    const place = openingPlace(['a', 'b'], 'z');
    expect(place).toEqual({ id: 'z', index: 0, isAwaited: true });
    expect(currentIndex(['a', 'b'], place)).toBe(0);
  });
});

describe('currentIndex', () => {
  it('follows the slide, not its place, when the set changes', () => {
    expect(currentIndex(['a', 'b', 'c'], on('b', 1))).toBe(1);
    expect(currentIndex(['new', 'a', 'b', 'c'], on('b', 1))).toBe(2);
    expect(currentIndex(['b', 'c'], on('b', 1))).toBe(0);
  });

  it('stays at the place of a slide that is gone, inside the set', () => {
    expect(currentIndex(['a', 'c'], on('b', 1))).toBe(1);
    expect(currentIndex(['a'], on('c', 2))).toBe(0);
    expect(currentIndex([], on('a', 0))).toBe(0);
  });

  it('takes numeric ids as React Aria keys', () => {
    expect(currentIndex([10, 20, 30], on(30, 0))).toBe(2);
  });
});

describe('followedPlace', () => {
  it('gives back the same place when nothing is to change', () => {
    const place = on('b', 1);
    expect(followedPlace(['a', 'b', 'c'], place)).toBe(place);
    expect(followedPlace([], place)).toBe(place);
  });

  it('moves with its slide when one arrives or leaves before it', () => {
    expect(followedPlace(['new', 'a', 'b'], on('b', 1))).toEqual(on('b', 2));
    expect(followedPlace(['b', 'c'], on('b', 1))).toEqual(on('b', 0));
  });

  it('follows the slide now at its place when its own has left', () => {
    expect(followedPlace(['a', 'c'], on('b', 1))).toEqual(on('c', 1));
    expect(followedPlace(['a'], on('c', 2))).toEqual(on('a', 0));
  });

  it('keeps awaiting a slide still to come, and goes to it when it arrives', () => {
    // A set read a page at a time: the slide opened on is in the second page.
    const opening = openingPlace(['a', 'b'], 'e');
    expect(followedPlace(['a', 'b'], opening)).toBe(opening);
    expect(followedPlace(['a', 'b', 'c', 'd'], opening)).toBe(opening);
    expect(followedPlace(['a', 'b', 'c', 'd', 'e', 'f'], opening)).toEqual(
      on('e', 4),
    );
  });
});

describe('turnedPlace', () => {
  it('steps back and on from the slide the carousel is on', () => {
    const ids = ['a', 'b', 'c'];
    expect(turnedPlace(ids, on('b', 1), 1)).toEqual(on('c', 2));
    expect(turnedPlace(ids, on('b', 1), -1)).toEqual(on('a', 0));
    // A slide arrived before the one shown: the step counts from where that slide is now.
    expect(turnedPlace(['new', ...ids], on('b', 1), 1)).toEqual(on('c', 3));
  });

  it('gives back the same place when the step goes nowhere', () => {
    const first = on('a', 0);
    const last = on('c', 2);
    expect(turnedPlace(['a', 'b', 'c'], first, -1)).toBe(first);
    expect(turnedPlace(['a', 'b', 'c'], last, 1)).toBe(last);
    const nowhere = on(undefined, 0);
    expect(turnedPlace([], nowhere, 1)).toBe(nowhere);
    // Before the slide opened on arrives, a step that goes nowhere still awaits it.
    const awaiting = openingPlace(['a', 'b'], 'e');
    expect(turnedPlace(['a', 'b'], awaiting, -1)).toBe(awaiting);
  });

  it('gives up an awaited slide once the person turns the carousel', () => {
    const awaiting = openingPlace(['a', 'b'], 'e');
    const turned = turnedPlace(['a', 'b'], awaiting, 1);
    expect(turned).toEqual(on('b', 1));
    expect(followedPlace(['a', 'b', 'c', 'd', 'e'], turned)).toBe(turned);
  });
});

describe('swipeIndex', () => {
  it('turns the page only past the threshold', () => {
    expect(swipeIndex(1, 3, -100, 1000, false)).toBe(1);
    expect(swipeIndex(1, 3, -150, 1000, false)).toBe(1);
    expect(swipeIndex(1, 3, -200, 1000, false)).toBe(2);
    expect(swipeIndex(1, 3, 200, 1000, false)).toBe(0);
  });

  it('never goes past an end, and stays put before the width is known', () => {
    expect(swipeIndex(0, 3, 400, 1000, false)).toBe(0);
    expect(swipeIndex(2, 3, -400, 1000, false)).toBe(2);
    expect(swipeIndex(1, 3, -400, 0, false)).toBe(1);
  });

  it('reads a drag the other way round right to left', () => {
    expect(swipeIndex(1, 3, 200, 1000, true)).toBe(2);
    expect(swipeIndex(1, 3, -200, 1000, true)).toBe(0);
  });
});

describe('usesArrowKeys', () => {
  it('leaves the arrows to text entry, native choices, and players', () => {
    expect(usesArrowKeys(element('input'))).toBe(true);
    expect(usesArrowKeys(element('input', 'text'))).toBe(true);
    expect(usesArrowKeys(element('input', 'range'))).toBe(true);
    expect(usesArrowKeys(element('input', 'radio'))).toBe(true);
    expect(usesArrowKeys(element('textarea'))).toBe(true);
    expect(usesArrowKeys(element('select'))).toBe(true);
    expect(usesArrowKeys(element('video'))).toBe(true);
    expect(usesArrowKeys(element('audio'))).toBe(true);
    expect(usesArrowKeys({ ...element('div'), isContentEditable: true })).toBe(
      true,
    );
  });

  it('takes them from buttons, checkboxes, and plain elements', () => {
    expect(usesArrowKeys(element('button'))).toBe(false);
    expect(usesArrowKeys(element('input', 'checkbox'))).toBe(false);
    expect(usesArrowKeys(element('input', 'submit'))).toBe(false);
    expect(usesArrowKeys(element('section'))).toBe(false);
    expect(usesArrowKeys(element('a'))).toBe(false);
  });
});

describe('arrowStep', () => {
  it('steps back and on on plain left and right presses', () => {
    expect(arrowStep(press('ArrowLeft'), false)).toBe(-1);
    expect(arrowStep(press('ArrowRight'), false)).toBe(1);
    expect(arrowStep(press('ArrowUp'), false)).toBeUndefined();
    expect(arrowStep(press('Enter'), false)).toBeUndefined();
  });

  it('turns the other way right to left', () => {
    expect(arrowStep(press('ArrowLeft'), true)).toBe(1);
    expect(arrowStep(press('ArrowRight'), true)).toBe(-1);
  });

  it('leaves a handled press or a modified one alone', () => {
    expect(
      arrowStep(press('ArrowRight', { defaultPrevented: true }), false),
    ).toBeUndefined();
    expect(arrowStep(press('ArrowLeft', { altKey: true }), false)).toBe(
      undefined,
    );
    expect(arrowStep(press('ArrowLeft', { ctrlKey: true }), false)).toBe(
      undefined,
    );
    expect(arrowStep(press('ArrowLeft', { metaKey: true }), false)).toBe(
      undefined,
    );
    expect(arrowStep(press('ArrowRight', { shiftKey: true }), false)).toBe(
      undefined,
    );
  });

  it('leaves a press to an element that uses the arrows itself', () => {
    expect(
      arrowStep(press('ArrowRight', { target: element('video') }), false),
    ).toBeUndefined();
    expect(
      arrowStep(
        press('ArrowLeft', { target: element('input', 'text') }),
        false,
      ),
    ).toBeUndefined();
    expect(arrowStep(press('ArrowRight', { target: null }), false)).toBe(1);
  });
});

describe('stripPosition', () => {
  it('moves the strip against the reading direction', () => {
    expect(stripPosition(0, 400, false)).toBe(0);
    expect(stripPosition(2, 400, false)).toBe(-800);
    expect(stripPosition(0, 400, true)).toBe(0);
    expect(stripPosition(2, 400, true)).toBe(800);
  });
});

describe('turnStart', () => {
  it('starts a turn of many places from the neighbor of the slide turned to', () => {
    // On: from the slide before the one turned to.
    expect(turnStart(0, 5, 100, false)).toBe(stripPosition(4, 100, false));
    expect(turnStart(0, 5, 100, false)).toBe(-400);
    // Back: from the slide after it.
    expect(turnStart(23, 0, 100, false)).toBe(-100);
    expect(turnStart(5, 2, 100, false)).toBe(-300);
  });

  it('starts from the mirrored place right to left', () => {
    expect(turnStart(0, 5, 100, true)).toBe(400);
    expect(turnStart(23, 0, 100, true)).toBe(100);
  });

  it('leaves a turn of one place, or none, to start where the strip stands', () => {
    expect(turnStart(3, 4, 100, false)).toBeUndefined();
    expect(turnStart(4, 3, 100, true)).toBeUndefined();
    expect(turnStart(3, 3, 100, false)).toBeUndefined();
  });
});

describe('dragBounds', () => {
  it('reaches the neighbors and no further', () => {
    expect(dragBounds(2, 5, 100, false)).toEqual({ left: -300, right: -100 });
    expect(dragBounds(2, 5, 100, true)).toEqual({ left: 100, right: 300 });
  });

  it('does not reach past an end', () => {
    expect(dragBounds(0, 5, 100, false)).toEqual({ left: -100, right: 0 });
    expect(dragBounds(4, 5, 100, false)).toEqual({ left: -400, right: -300 });
    expect(dragBounds(0, 1, 100, false)).toEqual({ left: 0, right: 0 });
  });
});

describe('scrubberPosition', () => {
  const track = { left: 100, width: 200 };

  it('names the slide under the pointer, as the slider takes it', () => {
    expect(scrubberPosition(100, track, 21, false)).toBe(1);
    expect(scrubberPosition(200, track, 21, false)).toBe(11);
    expect(scrubberPosition(300, track, 21, false)).toBe(21);
    expect(scrubberPosition(50, track, 21, false)).toBe(1);
    expect(scrubberPosition(350, track, 21, false)).toBe(21);
  });

  it('runs from the right right to left', () => {
    expect(scrubberPosition(300, track, 21, true)).toBe(1);
    expect(scrubberPosition(100, track, 21, true)).toBe(21);
  });

  it('names nothing on a track of no width or in an empty set', () => {
    expect(scrubberPosition(150, { left: 0, width: 0 }, 21, false)).toBe(
      undefined,
    );
    expect(scrubberPosition(150, track, 0, false)).toBeUndefined();
  });
});

describe('scrubberFraction', () => {
  it('places a slide along the track', () => {
    expect(scrubberFraction(1, 21)).toBe(0);
    expect(scrubberFraction(11, 21)).toBe(0.5);
    expect(scrubberFraction(21, 21)).toBe(1);
    expect(scrubberFraction(1, 1)).toBe(0);
  });
});
