import type { Meta } from '@storybook/web-components'
import type { WuiAllWalletsImage } from '@web3modal/ui/src/composites/wui-all-wallets-image'
import '@web3modal/ui/src/composites/wui-all-wallets-image'

import { html } from 'lit'

type Component = Meta<WuiAllWalletsImage>

export default {
  title: 'Composites/wui-all-wallets-image',
  args: {
    walletImages: [
      {
        src: 'https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/7a33d7f1-3d12-4b5c-f3ee-5cd83cb1b500?projectId=a8d876c6f91c3748db621583fad358f1',
        walletName: 'Rainbow'
      },
      {
        src: 'https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/f216b371-96cf-409a-9d88-296392b85800?projectId=f63a70d1bd9dd78b5eb556c25d11cf05',
        walletName: 'Zerion'
      },
      {
        src: 'https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/a7f416de-aa03-4c5e-3280-ab49269aef00?projectId=f63a70d1bd9dd78b5eb556c25d11cf05',
        walletName: 'Ledger'
      },
      {
        src: 'https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/7e1514ba-932d-415d-1bdb-bccb6c2cbc00?projectId=f63a70d1bd9dd78b5eb556c25d11cf05',
        walletName: 'Fireblocks'
      }
    ]
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-all-wallets-image .walletImages=${args.walletImages}></wui-all-wallets-image>`
}
