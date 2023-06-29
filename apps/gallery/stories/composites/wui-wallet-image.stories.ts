import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-wallet-image'
import type { WuiWalletImage } from '@web3modal/ui/src/composites/wui-wallet-image'
import { html } from 'lit'

type Component = Meta<WuiWalletImage>

export default {
  title: 'Composites/wui-wallet-image',
  args: {
    src: 'https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/7a33d7f1-3d12-4b5c-f3ee-5cd83cb1b500?projectId=a8d876c6f91c3748db621583fad358f1',
    walletName: 'Rainbow',
    size: 'md'
  },
  argTypes: {
    size: {
      options: ['sm', 'md', 'lg'],
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-wallet-image
      size=${args.size}
      .src=${args.src}
      alt=${args.walletName}
    ></wui-wallet-image>`
}
