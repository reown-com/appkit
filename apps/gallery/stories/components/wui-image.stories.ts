import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/components/wui-image'
import type { WuiImage } from '@web3modal/ui/src/components/wui-image'
import { html } from 'lit'
import { walletImageSrc } from '../../utils/PresetUtils'

type Component = Meta<WuiImage>

export default {
  title: 'Components/wui-image',
  args: {
    src: walletImageSrc,
    alt: 'Image of Rainbow'
  }
} as Component

export const Default: Component = {
  render: args => html`<wui-image src=${args.src} alt=${args.alt}></wui-image>`
}
