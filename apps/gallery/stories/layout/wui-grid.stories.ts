import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/layout/wui-grid'
import type { WuiGrid } from '@web3modal/ui/src/layout/wui-grid'
import { html } from 'lit'
import '../../components/gallery-placeholder'
import { gridContentOptions, gridItemsOptions, spacingOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiGrid>

export default {
  title: 'Layout/wui-grid',
  args: {
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 'm'
  },
  argTypes: {
    justifyItems: {
      options: gridItemsOptions,
      control: { type: 'select' }
    },
    alignItems: {
      options: gridItemsOptions,
      control: { type: 'select' }
    },
    justifyContent: {
      options: gridContentOptions,
      control: { type: 'select' }
    },
    alignContent: {
      options: gridContentOptions,
      control: { type: 'select' }
    },
    columnGap: {
      options: [...spacingOptions, undefined],
      control: { type: 'select' }
    },
    rowGap: {
      options: [...spacingOptions, undefined],
      control: { type: 'select' }
    },
    gap: {
      options: [...spacingOptions, undefined],
      control: { type: 'select' }
    },
    padding: {
      options: [...spacingOptions, undefined],
      control: { type: 'select' }
    },
    margin: {
      options: [...spacingOptions, undefined],
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-grid
      .gridTemplateColumns=${args.gridTemplateColumns}
      .gridTemplateRows=${args.gridTemplateRows}
      .justifyItems=${args.justifyItems}
      .alignItems=${args.alignItems}
      .justifyContent=${args.justifyContent}
      .alignContent=${args.alignContent}
      .columnGap=${args.columnGap}
      .rowGap=${args.rowGap}
      .gap=${args.gap}
      .padding=${args.padding}
      .margin=${args.margin}
    >
      <gallery-placeholder size="md" background="green"></gallery-placeholder>
      <gallery-placeholder size="md" background="red"></gallery-placeholder>
      <gallery-placeholder size="md" background="green"></gallery-placeholder>
      <gallery-placeholder size="md" background="red"></gallery-placeholder>
      <gallery-placeholder size="md" background="green"></gallery-placeholder>
      <gallery-placeholder size="md" background="red"></gallery-placeholder>
    </wui-grid>`
}
