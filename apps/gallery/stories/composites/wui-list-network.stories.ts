import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import type { WuiListNetwork } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-list-network'

import '../../components/gallery-container'
import { networkImageSrc, walletImagesOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiListNetwork>

export default {
  title: 'Composites/wui-list-network',
  args: {
    walletImages: walletImagesOptions,
    imageSrc: networkImageSrc,
    name: 'Ethereum',
    transparent: false
  },
  transparent: {
    control: { type: 'boolean' }
  }
} as Component

export const Default: Component = {
  render: args =>
    html` <gallery-container width="336">
      <wui-list-network
        .imageSrc=${args.imageSrc}
        ?disabled=${args.disabled}
        name=${args.name}
        ?transparent=${args.transparent}
      ></wui-list-network>
    </gallery-container>`
}
