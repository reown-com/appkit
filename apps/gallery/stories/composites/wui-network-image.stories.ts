import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-network-image'
import type { WuiNetworkImage } from '@web3modal/ui/src/composites/wui-network-image'
import { html } from 'lit'
import { networkImageSrc } from '../../utils/PresetUtils'

type Component = Meta<WuiNetworkImage>

export default {
  title: 'Composites/wui-network-image',
  args: {
    src: networkImageSrc,
    networkName: 'Ethereum'
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-network-image .src=${args.src} alt=${args.networkName}></wui-network-image>`
}
