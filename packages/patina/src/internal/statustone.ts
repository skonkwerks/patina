/**
 * The tones a state or a category may carry, the same five everywhere a component shows one (a
 * chip, an alert, a gauge). Each names a status token in the theme (`info`, `success`, `warning`,
 * `destructive`), and `neutral` is a plain category with no outcome. Families that take a tone
 * re-export this type, so it is defined once and an application imports it beside the component.
 */
export type StatusTone =
  'neutral' | 'info' | 'success' | 'warning' | 'destructive';
