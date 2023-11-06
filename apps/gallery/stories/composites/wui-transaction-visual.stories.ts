import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-transaction-visual'
import type { WuiTransactionVisual } from '@web3modal/ui/src/composites/wui-transaction-visual'
import { html } from 'lit'

import {
  transactionDirectionOptions,
  transactionTypeOptions,
  transactionStatusOptions
} from '../../utils/PresetUtils'

type Component = Meta<WuiTransactionVisual>

export default {
  title: 'Composites/wui-transaction-visual',
  args: {
    type: 'approve',
    imageURL:
      'https://uploads-ssl.webflow.com/61fe6bb74158b468a1112105/61fe8900148b6e6ee7c2c4e4_Profile%20Pic_Smoker-p-500.jpeg',
    status: 'confirmed',
    direction: 'in',
    isNFT: false
  },
  argTypes: {
    type: {
      options: transactionTypeOptions,
      control: { type: 'select' }
    },
    isNFT: {
      control: { type: 'boolean' }
    },
    imageURL: {
      control: { type: 'text' }
    },
    status: {
      options: transactionStatusOptions,
      control: { type: 'select' }
    },
    direction: {
      options: transactionDirectionOptions,
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-transaction-visual
      type=${args.type}
      imageURL=${args.imageURL}
      .isNFT=${args.isNFT}
      status=${args.status}
      direction=${args.direction}
    ></wui-transaction-visual>`
}
