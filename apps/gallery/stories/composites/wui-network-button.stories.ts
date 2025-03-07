import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-network-button'
import type { WuiNetworkButton } from '@reown/appkit-ui/wui-network-button'

import { networkImageSrc } from '../../utils/PresetUtils'

type Component = Meta<WuiNetworkButton>

export default {
  title: 'Composites/wui-network-button',
  args: {
    imageSrc: networkImageSrc,
    disabled: false
  },
  argTypes: {
    disabled: {
      control: { type: 'boolean' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-network-button ?disabled=${args.disabled} .imageSrc=${args.imageSrc}
      >Ethereum</wui-network-button
    >`
}
