import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-list-description'
import type { WuiListDescription } from '@reown/appkit-ui/wui-list-description'

import '../../components/gallery-container'
import { iconOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiListDescription>

export default {
  title: 'Composites/appkit-wui-list-description',
  args: {
    icon: 'card',
    text: 'Buy Crypto',
    tag: 'Popular',
    description: 'Easy with card or bank account'
  },
  argTypes: {
    icon: {
      options: iconOptions,
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html` <gallery-container width="336">
      <wui-list-description
        icon=${args.icon}
        text=${args.text}
        .tag=${args.tag}
        description=${args.description}
      ></wui-list-description>
    </gallery-container>`
}
