import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-flex'
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
      <wui-flex flexDirection="column" gap="4" alignItems="center">
        <wui-list-item
          .imageSrc=${args.imageSrc}
          .icon=${args.icon}
          ?disabled=${args.disabled}
          ?loading=${args.loading}
        >
          <wui-text variant="md-medium" color="primary">${args.text}</wui-text>
          <wui-text variant="md-regular" color="secondary">${args.subtext}</wui-text>
        </wui-list-item>
        <wui-list-item text="Disconnect" icon="power" iconColor="error" .rightIcon=${false}>
          <wui-text variant="md-medium" color="primary">Disconnect</wui-text>
        </wui-list-item>
      </wui-flex>
    </gallery-container>`
}
