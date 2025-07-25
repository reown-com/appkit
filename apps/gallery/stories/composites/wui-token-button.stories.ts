import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-token-button'
import type { WuiTokenButton } from '@reown/appkit-ui/wui-token-button'

import { networkImageSrc } from '../../utils/PresetUtils'

type Component = Meta<WuiTokenButton>

export default {
  title: 'Composites/wui-token-button',
  args: {
    text: 'ETH',
    imageSrc: networkImageSrc,
    loading: false
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-token-button text=${args.text} .imageSrc=${args.imageSrc} ?loading=${args.loading}
      >Recent</wui-token-button
    >`
}
