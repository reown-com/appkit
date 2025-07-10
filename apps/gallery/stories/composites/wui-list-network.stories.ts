import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import type { WuiListNetwork } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-list-network'

import '../../components/gallery-container'
import { networkImageSrc } from '../../utils/PresetUtils'

type Component = Meta<WuiListNetwork>

export default {
  title: 'Composites/appkit-wui-list-network',
  args: {
    imageSrc: networkImageSrc,
    name: 'Ethereum',
    disabled: false
  },
  disabled: {
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
      ></wui-list-network>
    </gallery-container>`
}
