/**
 * The tones a state or a category may carry, the same five everywhere a component shows one (a
 * chip, an alert, a gauge). Each names a status token in the theme (`info`, `success`, `warning`,
 * `error`), and `neutral` is a plain category with no outcome. A status that already happened is
 * `error`; `destructive` is kept for actions that will destroy something (a button's tone). Families that take a tone
 * re-export this type, so it is defined once and an application imports it beside the component.
 */
export type StatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'error';
