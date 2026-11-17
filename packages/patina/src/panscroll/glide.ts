/** How a released drag carries a scroll position on. */
export type Glide = {
  /** How long the glide runs, in seconds; zero when it starts at the end it heads for. */
  duration: number;
  /** The scroll position `t` seconds in, for `t` from 0 to `duration`. */
  at: (t: number) => number;
  /**
   * The velocity left on reaching an end that cut the glide short, in pixels per second, signed as
   * the glide; zero when the glide comes to rest first.
   */
  arrival: number;
};

/**
 * The glide of a scroll position from `from`, released at `velocity` pixels per second, within
 * `0..end`. It slows evenly, as friction would: unhindered, it comes to rest `reach` seconds' worth
 * of the release speed on, after twice that time, and it ends with `resolution` pixels to go (a
 * device pixel, the last step it could show), so it never creeps. An end in the way stops it
 * there with the velocity it still has, for a rebound; a start at or past that end takes no time.
 * No velocity, no glide.
 */
export const glidePlan = ({
  from,
  end,
  velocity,
  reach,
  resolution,
}: {
  from: number;
  end: number;
  velocity: number;
  reach: number;
  resolution: number;
}): Glide | undefined => {
  const speed = Math.abs(velocity);
  if (speed === 0) {
    return undefined;
  }
  const direction = Math.sign(velocity);
  const deceleration = speed / (2 * reach);
  const at = (t: number) =>
    from + direction * (speed * t - (deceleration * t ** 2) / 2);
  // A fractional scroll position can stand a part of a pixel past an end (the scroll size is
  // rounded, the position is not): there is no room then, never negative room.
  const room = Math.max(direction > 0 ? end - from : from, 0);
  if (room < reach * speed) {
    // The end comes first: the speed left there follows from v^2 = u^2 - 2as.
    const left = Math.sqrt(Math.max(speed ** 2 - 2 * deceleration * room, 0));
    return {
      duration: (speed - left) / deceleration,
      at,
      arrival: direction * left,
    };
  }
  // Unhindered, the glide would rest at 2 * reach seconds; it ends where `resolution` remains,
  // the distance left at time t being deceleration * (2 * reach - t)^2 / 2.
  return {
    duration: Math.max(
      2 * reach - Math.sqrt((2 * resolution) / deceleration),
      0,
    ),
    at,
    arrival: 0,
  };
};

/**
 * The glide of a scroller's horizontal scroll position, in its own `scrollLeft` values, released at
 * `velocity` pixels per second of `scrollLeft`. A left-to-right scroller's `scrollLeft` runs from 0
 * at the start to `maxScroll`; a right-to-left one's from 0 at the start down to `-maxScroll`
 * (CSSOM). So the glide is planned from the start edge and mapped back, and its positions and
 * arrival are `scrollLeft` values and velocities either way.
 */
export const scrollGlide = ({
  scrollLeft,
  maxScroll,
  velocity,
  isRightToLeft,
  reach,
  resolution,
}: {
  scrollLeft: number;
  maxScroll: number;
  velocity: number;
  isRightToLeft: boolean;
  reach: number;
  resolution: number;
}): Glide | undefined => {
  const sign = isRightToLeft ? -1 : 1;
  const glide = glidePlan({
    from: sign * scrollLeft,
    end: maxScroll,
    velocity: sign * velocity,
    reach,
    resolution,
  });
  if (!glide) {
    return undefined;
  }
  return {
    duration: glide.duration,
    at: (t) => sign * glide.at(t),
    // No velocity left is 0, never -0.
    arrival: glide.arrival === 0 ? 0 : sign * glide.arrival,
  };
};
