import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@laughingwhales/appkit-ui/wui-avatar'
import type { WuiAvatar } from '@laughingwhales/appkit-ui/wui-avatar'

import { address, avatarImageSrc } from '../../utils/PresetUtils'

type Component = Meta<WuiAvatar>

export default {
  title: 'Composites/appkit-wui-avatar',
  args: {
    imageSrc: avatarImageSrc,
    alt: 'Avatar',
    address
  }
} as Component

export const Default: Component = {
  render: args => html`
    <wui-avatar .address=${args.address} .imageSrc=${args.imageSrc} .alt=${args.alt}> </wui-avatar>
  `
}
