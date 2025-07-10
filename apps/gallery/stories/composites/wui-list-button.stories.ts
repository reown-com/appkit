import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import type { WuiListButton } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-list-button'

import '../../components/gallery-container'
import { iconOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiListButton>

export default {
  title: 'Composites/wui-list-button',
  args: {
    text: 'Continue with a wallet',
    size: 'lg',
    icon: 'checkMarkVerified'
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg']
    },
    icon: {
      control: { type: 'select' },
      options: iconOptions
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html` <gallery-container width="336">
      <wui-list-button text=${args.text} size=${args.size} icon=${args.icon}></wui-list-button>
    </gallery-container>`
}
