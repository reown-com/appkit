import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-list-item'
import type { WuiListItem } from '@reown/appkit-ui/wui-list-item'

import '../../components/gallery-container'
import { iconOptions, networkImageSrc } from '../../utils/PresetUtils'

type Component = Meta<WuiListItem>

export default {
  title: 'Composites/appkit-wui-list-item',
  args: {
    disabled: false,
    imageSrc: networkImageSrc,
    text: '0.527 ETH',
    subtext: '637.38 USD',
    loading: false
  },
  argTypes: {
    disabled: {
      control: { type: 'boolean' }
    },
    icon: {
      options: iconOptions,
      control: { type: 'select' }
    },
    loading: {
      control: { type: 'boolean' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html` <gallery-container width="336">
      <wui-list-item
        .imageSrc=${args.imageSrc}
        .text=${args.text}
        .subtext=${args.subtext}
        .icon=${args.icon}
        ?disabled=${args.disabled}
        ?loading=${args.loading}
      >
      </wui-list-item>
    </gallery-container>`
}
