import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Checkbox } from '../aria/checkbox/index.ts';
import {
  ColorArea,
  ColorSlider,
  ColorSwatch,
  ColorWheel,
} from '../aria/color/index.ts';
import { ComboBox } from '../aria/combobox/index.ts';
import { DateField } from '../aria/datefield/index.ts';
import { DatePicker } from '../aria/datepicker/index.ts';
import { ListBoxItem } from '../aria/listbox/index.ts';
import { Radio, RadioGroup } from '../aria/radiogroup/index.ts';
import { Slider } from '../aria/slider/index.ts';
import { Switch } from '../aria/switch/index.ts';
import { TextField } from '../aria/textfield/index.ts';
import { Token, TokenField } from '../aria/tokenfield/index.ts';
import { InfoButton } from '../composites/infobutton/index.ts';
import {
  contrastRatio,
  edgeColor,
  NON_TEXT_CONTRAST,
} from './contrast.testing.ts';

/** Every layer and hover fill a control stands on, as the token contract names them. */
const layers = [
  'bg-canvas',
  'bg-surface',
  'bg-surface-hover',
  'bg-overlay',
  'bg-overlay-hover',
  'bg-input',
] as const;

/**
 * The edges drawn in `control-border`: one for each control, unchecked and off, and two for the
 * color wheel (the outer and the inner edge of its track). `TimeField` and `DateRangePicker` draw
 * the same boxes as `DateField` and `DatePicker`, so they add none; a combo box's options and a
 * token field's tokens are not drawn while it is closed and empty.
 */
const EDGES_PER_LAYER = 14;

const Controls = ({ id }: { id: string }) => (
  <div className='flex flex-col gap-3'>
    <TextField
      label={`Name ${id}`}
      info={<InfoButton aria-label={`About names ${id}`} />}
    />
    <DateField label={`Start ${id}`} />
    <DatePicker
      label={`Due ${id}`}
      info={<InfoButton aria-label={`About due dates ${id}`} />}
    />
    <ComboBox
      label={`Region ${id}`}
      noMatchesLabel='No regions match'
      info={<InfoButton aria-label={`About regions ${id}`} />}
    >
      <ListBoxItem id='north'>North</ListBoxItem>
    </ComboBox>
    <TokenField label={`Topics ${id}`}>
      {(segment) => <Token>{segment.text}</Token>}
    </TokenField>
    <Checkbox>{`Remember ${id}`}</Checkbox>
    <RadioGroup label={`Size ${id}`}>
      <Radio value='small'>Small</Radio>
    </RadioGroup>
    <Switch>{`Notify ${id}`}</Switch>
    <Slider
      label={`Volume ${id}`}
      defaultValue={40}
      info={<InfoButton aria-label={`About volume ${id}`} />}
    />
    {/* The color controls at their lightest, white and clear, where the edge alone shows them. */}
    <ColorSwatch color='#ffffff' />
    <ColorSlider
      aria-label={`Fill alpha ${id}`}
      channel='alpha'
      defaultValue='hsla(0, 0%, 100%, 0)'
    />
    <ColorArea aria-label={`Fill ${id}`} className='w-16' />
    <ColorWheel aria-label={`Fill hue ${id}`} />
  </div>
);

/** The controls on every layer, in the light mode and, inside `.dark`, in the dark mode. */
const ControlEdges = () => (
  <div className='flex flex-col gap-4'>
    {(['light', 'dark'] as const).map((mode) => (
      <div
        key={mode}
        className={`${mode === 'dark' ? 'dark' : ''} grid grid-cols-3 gap-2`}
      >
        {layers.map((layer) => (
          <div
            key={layer}
            data-layer={`${mode} ${layer}`}
            className={`${layer} text-surface-foreground rounded-md p-3`}
          >
            <Controls id={`${mode} ${layer}`} />
          </div>
        ))}
      </div>
    ))}
  </div>
);

const meta = {
  title: 'Contract/Control edges',
  component: ControlEdges,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ControlEdges>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Every control's edge (a field's box, a date field's, a date picker's, a combo box's and a token
 * field's, a checkbox's and a radio's mark, a switch's off track, a slider's rail, a color
 * swatch's, a color slider's track's, a color area's, and a color wheel's two) is drawn in
 * `control-border` and reaches 3:1 against each layer and hover fill it can stand on, in both modes
 * of the theme: the non-text contrast an interface component needs.
 */
export const ReachesThreeToOne: Story = {
  play: async ({ canvasElement }) => {
    const cells = [
      ...canvasElement.querySelectorAll<HTMLElement>('[data-layer]'),
    ];
    await expect(cells).toHaveLength(layers.length * 2);
    for (const cell of cells) {
      const layer = getComputedStyle(cell).backgroundColor;
      const edges = [
        ...cell.querySelectorAll<HTMLElement>(
          '[class*="border-control-border"], [class*="bg-control-border"], [class*="ring-control-border"]',
        ),
      ];
      // Each control draws its edge with the token; one that drew it with another token is missing.
      await expect(edges, cell.dataset.layer).toHaveLength(EDGES_PER_LAYER);
      for (const edge of edges) {
        await expect(
          contrastRatio(edgeColor(edge), layer),
          `${cell.dataset.layer}: ${edge.className}`,
        ).toBeGreaterThanOrEqual(NON_TEXT_CONTRAST);
      }
    }
  },
};
