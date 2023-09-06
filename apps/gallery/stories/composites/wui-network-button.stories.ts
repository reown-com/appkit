import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-network-button'
import type { WuiNetworkButton } from '@web3modal/ui/src/composites/wui-network-button'
import { html } from 'lit'
import { networkImageSrc } from '../../utils/PresetUtils'

type Component = Meta<WuiNetworkButton>

export default {
  title: 'Composites/wui-network-button',
  args: {
    imageSrc: networkImageSrc,
    variant: 'fill'
  },
  argTypes: {
    variant: {
      options: ['fill', 'shade'],
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-network-button .imageSrc=${args.imageSrc} variant=${args.variant}>
      Ethereum
    </wui-network-button>`
}
