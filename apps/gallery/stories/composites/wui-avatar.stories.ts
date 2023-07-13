import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-avatar'
import type { WuiAvatar } from '@web3modal/ui/src/composites/wui-avatar'
import { html } from 'lit'
import { address, avatarImageSrc } from '../../utils/PresetUtils'

type Component = Meta<WuiAvatar>

export default {
  title: 'Composites/wui-avatar',
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
