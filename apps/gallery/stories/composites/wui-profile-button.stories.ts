import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-profile-button'
import type { WuiProfileButton } from '@reown/appkit-ui/wui-profile-button'

import { address, avatarImageSrc, networkImageSrc } from '../../utils/PresetUtils'

type Component = Meta<WuiProfileButton>

export default {
  title: 'Composites/wui-profile-button',
  args: {
    networkSrc: networkImageSrc,
    avatarSrc: avatarImageSrc,
    address,
    profileName: 'johndoe.eth'
  },
  argTypes: {
    profileName: {
      control: { type: 'text' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-profile-button
      profileName=${args.profileName}
      .networkSrc=${args.networkSrc}
      .avatarSrc=${args.avatarSrc}
      address=${args.address}
    ></wui-profile-button>`
}
