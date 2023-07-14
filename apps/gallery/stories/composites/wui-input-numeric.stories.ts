import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-input-numeric'
import '../../components/gallery-container'
import type { WuiInputNumeric } from '@web3modal/ui/src/composites/wui-input-numeric'
import { html } from 'lit'

type Component = Meta<WuiInputNumeric>

export default {
  title: 'Composites/wui-input-numeric',
  args: {
    disabled: false
  },
  argTypes: {
    disabled: {
      control: { type: 'boolean' }
    }
  }
} as Component

export const Default: Component = {
  render: args => html` <wui-input-numeric ?disabled=${args.disabled}></wui-input-numeric>`
}
