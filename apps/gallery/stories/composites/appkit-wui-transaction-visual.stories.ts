import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import type { TransactionImage } from '@reown/appkit-common'
import '@reown/appkit-ui/wui-transaction-visual'
import type { WuiTransactionVisual } from '@reown/appkit-ui/wui-transaction-visual'

import '../../components/gallery-container'
import { walletImagesOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiTransactionVisual>

export default {
  title: 'Composites/apkt-transaction-visual',
  args: {
    type: 'approve',
    status: 'confirmed',
    direction: 'in',
    onlyDirectionIcon: false,
    images: [
      {
        type: 'NFT',
        url: walletImagesOptions[0]?.src
      }
    ]
  },
  argTypes: {
    type: {
      control: 'select',
      options: [
        'approve',
        'bought',
        'borrow',
        'burn',
        'cancel',
        'claim',
        'deploy',
        'deposit',
        'execute',
        'mint',
        'receive',
        'repay',
        'send',
        'stake',
        'trade',
        'unstake',
        'withdraw'
      ]
    },
    status: {
      control: 'select',
      options: ['confirmed', 'failed', 'pending']
    },
    direction: {
      control: 'select',
      options: ['in', 'out', 'self']
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html` <gallery-container width="336">
      <wui-transaction-visual
        .type=${args.type}
        .status=${args.status}
        .direction=${args.direction}
        .onlyDirectionIcon=${args.onlyDirectionIcon}
        .images=${args.images}
      ></wui-transaction-visual>
    </gallery-container>`
}

export const MultipleTransactions: Component = {
  render: args =>
    html` <gallery-container width="336">
      <wui-transaction-visual
        .type=${args.type}
        .status=${args.status}
        .direction=${args.direction}
        .onlyDirectionIcon=${args.onlyDirectionIcon}
        .images=${[
          {
            type: 'NFT' as const,
            url: walletImagesOptions[0]?.src
          },
          {
            type: 'NFT' as const,
            url: walletImagesOptions[1]?.src
          }
        ] as TransactionImage[]}
      ></wui-transaction-visual>
    </gallery-container>`
}

export const FirstImageBroken: Component = {
  render: args =>
    html` <gallery-container width="336">
      <wui-transaction-visual
        .type=${args.type}
        .status=${args.status}
        .direction=${args.direction}
        .onlyDirectionIcon=${args.onlyDirectionIcon}
        .images=${[
          {
            type: 'NFT' as const,
            url: 'https://lab.reown.com/invalid-image-url.png'
          },
          {
            type: 'NFT' as const,
            url: walletImagesOptions[1]?.src
          }
        ] as TransactionImage[]}
      ></wui-transaction-visual>
    </gallery-container>`
}

export const SecondImageBroken: Component = {
  render: args =>
    html` <gallery-container width="336">
      <wui-transaction-visual
        .type=${args.type}
        .status=${args.status}
        .direction=${args.direction}
        .onlyDirectionIcon=${args.onlyDirectionIcon}
        .images=${[
          {
            type: 'NFT' as const,
            url: walletImagesOptions[0]?.src
          },
          {
            type: 'NFT' as const,
            url: 'https://lab.reown.com/invalid-image-url.png'
          }
        ] as TransactionImage[]}
      ></wui-transaction-visual>
    </gallery-container>`
}

export const BothImagesBroken: Component = {
  render: args =>
    html` <gallery-container width="336">
      <wui-transaction-visual
        .type=${args.type}
        .status=${args.status}
        .direction=${args.direction}
        .onlyDirectionIcon=${args.onlyDirectionIcon}
        .images=${[
          {
            type: 'NFT' as const,
            url: 'https://lab.reown.com/invalid-image-url.png'
          },
          {
            type: 'NFT' as const,
            url: 'https://lab.reown.com/invalid-image-url2.png'
          }
        ] as TransactionImage[]}
      ></wui-transaction-visual>
    </gallery-container>`
}

export const SingleImageBroken: Component = {
  render: args =>
    html` <gallery-container width="336">
      <wui-transaction-visual
        .type=${args.type}
        .status=${args.status}
        .direction=${args.direction}
        .onlyDirectionIcon=${args.onlyDirectionIcon}
        .images=${[
          {
            type: 'NFT' as const,
            url: 'https://lab.reown.com/invalid-image-url.png'
          }
        ] as TransactionImage[]}
      ></wui-transaction-visual>
    </gallery-container>`
}
