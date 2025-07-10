import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-image'
import type { WuiImage } from '@reown/appkit-ui/wui-image'

import { walletImageSrc } from '../../utils/PresetUtils'

type Component = Meta<WuiImage>

export default {
  title: 'Components/appkit-wui-image',
  args: {
    src: walletImageSrc,
    alt: 'Image of Rainbow',
    boxed: false
  },
  argTypes: {
    boxed: {
      control: { type: 'boolean' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-image .src=${args.src} alt=${args.alt} ?boxed=${args.boxed}></wui-image>`
}
