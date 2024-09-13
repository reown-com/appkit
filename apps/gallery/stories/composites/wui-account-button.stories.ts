import type { Meta } from '@storybook/web-components'
import '@reown/appkit-ui/src/composites/wui-account-button'
import type { WuiAccountButton } from '@reown/appkit-ui/src/composites/wui-account-button'
import { html } from 'lit'
import { address, avatarImageSrc, networkImageSrc } from '../../utils/PresetUtils'

type Component = Meta<WuiAccountButton>

export default {
  title: 'Composites/wui-account-button',
  args: {
    disabled: false,
    networkSrc: networkImageSrc,
    avatarSrc: avatarImageSrc,
    address,
    balance: '0.527 ETH',
    profileName: 'johndoe.eth',
    charsStart: 4,
    charsEnd: 6
  },
  argTypes: {
    disabled: {
      control: { type: 'boolean' }
    },
    profileName: {
      control: { type: 'text' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-account-button
      ?disabled=${args.disabled}
      profileName=${args.profileName}
      .networkSrc=${args.networkSrc}
      .avatarSrc=${args.avatarSrc}
      .balance=${args.balance}
      address=${args.address}
      .charsStart=${args.charsStart}
      .charsEnd=${args.charsEnd}
    ></wui-account-button>`
}
