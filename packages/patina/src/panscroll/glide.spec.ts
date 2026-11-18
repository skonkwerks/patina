import { describe, expect, it } from 'vitest';

import { glidePlan, scrollGlide } from './glide.js';

describe('glidePlan', () => {
  it('makes no glide without velocity', () => {
    expect(
      glidePlan({
        from: 100,
        end: 1000,
        velocity: 0,
        reach: 0.3,
        resolution: 1,
      }),
    ).toBeUndefined();
  });

  it('slows evenly to rest, ending a resolution short of where it would stop', () => {
    const glide = glidePlan({
      from: 100,
      end: 10_000,
      velocity: 1000,
      reach: 0.3,
      resolution: 0.5,
    });
    // Unhindered, it would stop reach * speed (300) on, after twice the reach (0.6 s).
    expect(glide?.arrival).toBe(0);
    expect(glide?.at(0)).toBe(100);
    expect(glide?.duration).toBeLessThan(0.6);
    expect(glide?.at(glide.duration)).toBeCloseTo(399.5, 6);
    expect(glide?.at(0.6)).toBeCloseTo(400, 6);
  });

  it('glides towards the start for a negative velocity', () => {
    const glide = glidePlan({
      from: 5000,
      end: 10_000,
      velocity: -1000,
      reach: 0.3,
      resolution: 0.5,
    });
    expect(glide?.arrival).toBe(0);
    expect(glide?.at(glide.duration)).toBeCloseTo(4700.5, 6);
  });

  it('stops at an end in the way, with the velocity it still has', () => {
    const forward = glidePlan({
      from: 9900,
      end: 10_000,
      velocity: 1000,
      reach: 0.3,
      resolution: 0.5,
    });
    // v^2 = u^2 - 2as, with a = speed / (2 * reach).
    const left = Math.sqrt(1000 ** 2 - 2 * (1000 / 0.6) * 100);
    expect(forward?.arrival).toBeCloseTo(left, 6);
    expect(forward?.at(forward.duration)).toBeCloseTo(10_000, 6);

    const back = glidePlan({
      from: 50,
      end: 10_000,
      velocity: -1000,
      reach: 0.3,
      resolution: 0.5,
    });
    expect(back?.arrival).toBeLessThan(0);
    expect(back?.at(back.duration)).toBeCloseTo(0, 6);
  });

  it('takes no time when it starts at the end it heads for', () => {
    const glide = glidePlan({
      from: 1000,
      end: 1000,
      velocity: 800,
      reach: 0.3,
      resolution: 0.5,
    });
    expect(glide?.duration).toBe(0);
    expect(glide?.arrival).toBe(800);
  });

  it('takes no time, never a negative one, when it starts a part of a pixel past an end', () => {
    // scrollLeft is fractional while the scroll size is rounded, so a position can pass an end.
    const forward = glidePlan({
      from: 1000.4,
      end: 1000,
      velocity: 800,
      reach: 0.3,
      resolution: 0.5,
    });
    expect(forward?.duration).toBe(0);
    expect(forward?.arrival).toBe(800);

    const back = glidePlan({
      from: -0.3,
      end: 1000,
      velocity: -800,
      reach: 0.3,
      resolution: 0.5,
    });
    expect(back?.duration).toBe(0);
    expect(back?.arrival).toBe(-800);
  });

  it('takes no time when the whole glide is less than the resolution', () => {
    const glide = glidePlan({
      from: 100,
      end: 1000,
      velocity: 1,
      reach: 0.3,
      resolution: 0.5,
    });
    expect(glide?.duration).toBe(0);
    expect(glide?.arrival).toBe(0);
  });
});

describe('scrollGlide', () => {
  const plan = { maxScroll: 1000, reach: 0.3, resolution: 0.5 };

  it('glides a left-to-right scroller in its own scrollLeft values', () => {
    const glide = scrollGlide({
      ...plan,
      scrollLeft: 100,
      velocity: 1000,
      isRightToLeft: false,
    });
    expect(glide?.arrival).toBe(0);
    expect(glide?.at(0.6)).toBeCloseTo(400, 6);
  });

  it('glides a right-to-left scroller towards its far end, at negative scrollLeft', () => {
    // Right to left, the far end is scrollLeft -1000, so a negative velocity heads for it.
    const glide = scrollGlide({
      ...plan,
      scrollLeft: -100,
      velocity: -1000,
      isRightToLeft: true,
    });
    expect(glide?.arrival).toBe(0);
    expect(glide?.at(0)).toBe(-100);
    expect(glide?.at(0.6)).toBeCloseTo(-400, 6);
  });

  it('rebounds a right-to-left scroller at its start, scrollLeft 0, with a scrollLeft velocity', () => {
    const glide = scrollGlide({
      ...plan,
      scrollLeft: -50,
      velocity: 1000,
      isRightToLeft: true,
    });
    // 50 pixels of room towards the start, short of the 300 the glide would carry.
    expect(glide?.arrival).toBeGreaterThan(0);
    expect(glide?.at(glide.duration)).toBeCloseTo(0, 6);
  });

  it('rebounds a right-to-left scroller at its far end, scrollLeft -maxScroll', () => {
    const glide = scrollGlide({
      ...plan,
      scrollLeft: -950,
      velocity: -1000,
      isRightToLeft: true,
    });
    expect(glide?.arrival).toBeLessThan(0);
    expect(glide?.at(glide.duration)).toBeCloseTo(-1000, 6);
  });

  it('takes no time when a right-to-left scroller stands a part of a pixel past its far end', () => {
    const glide = scrollGlide({
      ...plan,
      scrollLeft: -1000.4,
      velocity: -800,
      isRightToLeft: true,
    });
    expect(glide?.duration).toBe(0);
    expect(glide?.arrival).toBe(-800);
  });
});
