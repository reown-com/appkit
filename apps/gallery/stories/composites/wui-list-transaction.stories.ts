import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-list-transaction'
import type { WuiListTransaction } from '@web3modal/ui/src/composites/wui-list-transaction'
import { html } from 'lit'
import '../../components/gallery-container'
import { transactionOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiListTransaction>

export default {
  title: 'Composites/wui-list-transaction',
  args: {
    type: 'bought',
    disabled: false,
    imageSrc:
      'https://uploads-ssl.webflow.com/61fe6bb74158b468a1112105/61fe8900148b6e6ee7c2c4e4_Profile%20Pic_Smoker-p-500.jpeg',
    date: new Date(),
    transactionDetail: '+0.8 Socks'
  },
  argTypes: {
    type: {
      options: transactionOptions,
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html` <gallery-container width="336">
      <wui-list-transaction
        type=${args.type}
        .date=${args.date}
        imageSrc=${args.imageSrc}
        transactionDetail=${args.transactionDetail}
        ?disabled=${args.disabled}
      >
      </wui-list-transaction>
    </gallery-container>`
}
