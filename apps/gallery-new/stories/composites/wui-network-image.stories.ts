import type { Meta } from '@storybook/web-components'
import '@reown/appkit-ui-new/src/composites/wui-network-image'
import type { WuiNetworkImage } from '@reown/appkit-ui-new/src/composites/wui-network-image'
import { html } from 'lit'
import { networkImageSrc } from '../../utils/PresetUtils'

type Component = Meta<WuiNetworkImage>

export default {
  title: 'Composites/wui-network-image',
  args: {
    imageSrc: networkImageSrc,
    name: 'Ethereum',
    selected: false,
    size: 'md'
  },
  argTypes: {
    size: {
      options: ['xs', 'sm', 'md', 'lg'],
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-network-image
      .imageSrc=${args.imageSrc}
      alt=${args.name}
      .selected=${args.selected}
      size=${args.size}
    ></wui-network-image>`
}
