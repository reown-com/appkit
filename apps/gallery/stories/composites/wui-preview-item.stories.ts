import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-preview-item'
import type { WuiPreviewItem } from '@web3modal/ui/src/composites/wui-preview-item'
import { html } from 'lit'
import { address, networkImageSrc } from '../../utils/PresetUtils'

type Component = Meta<WuiPreviewItem>

export default {
  title: 'Composites/wui-preview-item',
  args: {
    imageSrc: networkImageSrc,
    address,
    text: '0.2 ETH',
    isAddress: false
  },
  argTypes: {
    isAddress: {
      control: { type: 'boolean' }
    }
  }
} as Component

export const Default: Component = {
  render: args => html`
    <wui-preview-item
      text=${args.text}
      ?isAddress=${args.isAddress}
      .address=${args.address}
      .imageSrc=${args.imageSrc}
    >
    </wui-preview-item>
  `
}
