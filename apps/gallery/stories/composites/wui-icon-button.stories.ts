import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-icon-button'
import type { WuiIconButton } from '@reown/appkit-ui/wui-icon-button'

import '../../components/gallery-container'
import { iconOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiIconButton>

export default {
  title: 'Composites/wui-icon-button',
  args: {
    icon: 'card',
    text: 'Buy'
  },
  argTypes: {
    icon: {
      options: iconOptions,
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args => html`
    <gallery-container width="120">
      <wui-icon-button icon=${args.icon} text=${args.text}></wui-icon-button>
    </gallery-container>
  `
}
