import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/components/wui-visual'
import type { WuiVisual } from '@web3modal/ui/src/components/wui-visual'
import { html } from 'lit'
import { visualOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiVisual>

export default {
  title: 'Components/wui-visual',
  args: {
    name: 'browser'
  },
  argTypes: {
    name: {
      options: visualOptions,
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args => html`<wui-visual name=${args.name}></wui-visual>`
}
