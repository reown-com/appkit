import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@laughingwhales/appkit-ui/wui-input-numeric'
import type { WuiInputNumeric } from '@laughingwhales/appkit-ui/wui-input-numeric'

import '../../components/gallery-container'

type Component = Meta<WuiInputNumeric>

export default {
  title: 'Composites/appkit-wui-input-numeric',
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
