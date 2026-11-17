# @skonkwerks/patina

Styled wrappers around [React Aria Components](https://react-spectrum.adobe.com/react-aria/), themed with Tailwind CSS tokens. React Aria handles accessibility, keyboard behavior and focus. These wrappers add one consistent look, and the app's theme decides every color.

## The hard rule: no outside dependencies

The wrappers import only:

- `react` and `react-aria-components` (peer dependencies)
- `tailwind-variants`
- `cn` from `util.ts`, which is the only place `clsx` and `tailwind-merge` are used
- the package's own files

Nothing else, including no icon library, no animation library and nothing from the sibling `@skonkwerks/patina-*` packages. Two things enforce the rule:

1. **pnpm's strict resolution.** `package.json` lists only those dependencies, so any other import fails to resolve.
2. **ESLint.** A `no-restricted-imports` rule in the root `eslint.config.mjs` reports any other import in `packages/aria/src`. Stories may also import Storybook's types.

What the wrappers need from outside is drawn in, not imported:

- **Icons:** the few icons the wrappers draw are inline SVG in `src/icons.tsx` (copied from Tabler Icons, MIT; see `THIRDPARTY.md`). An app uses whatever icon library it likes for its own icons.
- **Spinner:** `Spinner` and `PendingStatus` in `src/spinner.tsx` are plain SVG.
- **Error notices:** `Table` and `GridList` take `error` as a `ReactNode`. The app renders its own notice (for example a `LoadFailure` with a retry button).

## Using it in an app

1. Add the dependency. While the package is private, install it through the workspace or a local link:

   ```json
   "@skonkwerks/patina": "link:../patina/packages/aria"
   ```

   A linked package resolves its own imports from patina's `node_modules`, so the app could end up with two copies of React and React Aria, which breaks hooks and context. Tell Vite to use the app's copies:

   ```ts
   // vite.config.ts
   export default defineConfig({
     resolve: { dedupe: ['react', 'react-dom', 'react-aria-components'] },
   });
   ```

2. In the app's Tailwind entry CSS:

   ```css
   @import 'tailwindcss';
   @plugin 'tailwindcss-react-aria-components';
   @import '@skonkwerks/patina/aria.css';
   ```

   `aria.css` tells Tailwind to scan the wrappers for their classes (`@source`). The `tailwindcss-react-aria-components` plugin gives the React Aria state variants the wrappers use (`selected:`, `hover:` and `disabled:` on React Aria's `data-*` attributes). The plugin is a dependency of the app's CSS, not of the wrappers.

3. Define the color tokens in the app's theme, once per mode. `aria.css` lists them all:

   ```css
   @theme inline {
     --color-surface: var(--my-surface);
     --color-surface-text: var(--my-surface-text);
     /* …every token aria.css lists */
   }
   ```

4. Import each component from its own path:

   ```tsx
   import { Button } from '@skonkwerks/patina/button';
   import { TextField } from '@skonkwerks/patina/textfield';
   import { GridList, GridListRow } from '@skonkwerks/patina/gridlist';
   ```

## Naming spec

Every component follows these rules. Familiar names come first: React Aria's own names, then the vocabulary of shadcn/ui and HeroUI. When a component breaks a rule, that's a bug.

### Color tokens

- A fill is `{name}`. Text on it is `{name}-foreground`, and quieter text on it is `{name}-foreground-muted`.
- **Layers:** `canvas`, `surface`, `overlay`, `input`. Each has `-foreground`, `-foreground-muted` (or `input-placeholder`) and `-border`. `surface` and `overlay` also have `-hover`, the highlight of a hovered or focused row or item on that layer.
- **Actions:** `primary`, `neutral`, `destructive`. Each has `-foreground` and `-hover`.
- **Statuses:** `info`, `success`, `warning`, and `destructive` for errors. Each has `-foreground` and `-tint`.
- **Other:** `focus-ring`, `scrim`.
- **Danger is always `destructive`:** the token, the Button `tone` and `MenuItem`'s `isDestructive` all use it. It's never called `error` or `danger`.
- **Disabled is one rule everywhere:** `opacity-50` and `cursor-not-allowed`, defined once as `DISABLED` in `src/disabled.ts` and given as the `true` value of each component's `isDisabled` variant. It is applied to the control and its label, part by part, never to a container around faded parts (two fades would compound). Text that is not the label of a disabled control (a description, an error, a slider's value) keeps its contrast. One exception: a slider's label also keeps its contrast, because it names the thumb's input through `aria-labelledby` rather than `for`, so the automated contrast check cannot tell it belongs to a disabled control; the slider's rail and thumb show that it is disabled. There's no `-disabled` token.

`aria.css` lists the full contract.

### Look props

Every button-like component (`Button`, `IconButton`, `LinkButton`, `Toggle`, `IconToggle`) uses the same words:

| Prop      | Values                              | Meaning                                                                         |
| --------- | ----------------------------------- | ------------------------------------------------------------------------------- |
| `variant` | `solid`, `outline`, `ghost`, `link` | How it looks. Toggles use `outline` and `ghost`.                                |
| `tone`    | `neutral`, `primary`, `destructive` | What it means.                                                                  |
| `size`    | `sm`, `md`, `lg`                    | The one control scale: **28px, 32px (default), 36px**. Compact, for dashboards. |
| `radius`  | `md`, `full`                        | Rounded corners, or a pill (a circle on an `IconButton`).                       |

- **Text or icon is a choice of component, not a prop.** `Button` and `Toggle` hold a text label (optionally with an icon beside it). A control that shows only an icon is an `IconButton` or `IconToggle`: a square (or a circle with `radius='full'`) of the size's height, with `aria-label` required by its type. There is no `isIconOnly` switch.
- **Defaults:** `variant='outline'`, `tone='neutral'`, `size='md'`, `radius='md'`. `IconButton` defaults to `variant='ghost'`.
- **A round ghost button on a surface,** such as a close button: `<IconButton radius='full' aria-label='Close'>`.
- **Text fields, selects and other inputs** are 32px tall, the same as an `md` button.
- **Other components that take a `size`** use the same `sm | md | lg` words, for example `Spinner` and `InlineMetadata`. A width is never called `size`: Table's `Column` takes `width`.

### Props

- **Booleans** start with `is`, `has` or `allows`, as in React Aria: `isPending`, `isDisabled`, `isDismissable`, `hasTooltip`, `hasActionSpace`, `hasValueOutput`, `allowsWrapping`. Never a bare adjective (`small`, `ghost`) or a verb phrase (`holdsWork`).
- **Pending:** `isPending` plus `pendingText` everywhere. There's no `loadingText` and no string `pending`.
- **Text:**
  - Fields: `label`, `description`, `errorMessage`, `placeholder`, and `contextualHelp` for a help control next to the label.
  - Containers (dialogs, sections, rows, empty states): `title` and `description`.
  - An accessible name with no visible text: `aria-label`.
  - Localized text for an inner control: `{control}Label` (`closeLabel`, `clearLabel`, `searchLabel`).
- **Slots (ReactNode props)** are named by meaning, and plural for groups: `actions`, `badges`, `media`, `endContent`, `headerContent`, `contextualHelp`.
- **Errors in a collection:** `error`, a ReactNode the app renders.

### Styles

- Every component's look is an exported `tv()` named `{component}Styles` (`buttonStyles`, `dialogStyles`, `tableCellStyles`), so an app can extend a look without forking the component.
- Multi-part components use `slots`.
- State variants use React Aria's render-state names (`isSelected`, `isHovered`, `isFocusVisible`, `isDisabled`).

### Components and files

- **Component names follow React Aria** where one exists (`Button`, `Dialog`, `GridList`, `Table`). Otherwise use the common name: `Spinner`, `ActionMenu`, `EmptyState`.
- **File names and import paths have no hyphens:** `textfield`, `iconbutton`, `gridlist/loadmore`.

## Viewing the components

Every component has stories next to it (`*.stories.tsx`). From the repository root:

```sh
pnpm storybook
```

Storybook opens at http://localhost:6006 with a light/dark switch in the toolbar. Each story is checked for accessibility with axe in the Accessibility panel.
