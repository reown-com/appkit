import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-card-select-loader'
import type { WuiCardSelectLoader } from '@web3modal/ui/src/composites/wui-card-select-loader'
import { html } from 'lit'
import { cardSelectOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiCardSelectLoader>

export default {
  title: 'Composites/wui-card-select-loader',
  args: {
    type: 'wallet'
  },
  argTypes: {
    type: {
      options: cardSelectOptions,
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args => html`<wui-card-select-loader type=${args.type}></wui-card-select-loader>`
}
