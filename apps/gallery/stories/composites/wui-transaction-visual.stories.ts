import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-transaction-visual'
import type { WuiTransactionVisual } from '@web3modal/ui/src/composites/wui-transaction-visual'
import { html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'

import { transactionOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiTransactionVisual>

export default {
  title: 'Composites/wui-transaction-visual',
  args: {
    type: 'bought',
    imageSrc:
      'https://uploads-ssl.webflow.com/61fe6bb74158b468a1112105/61fe8900148b6e6ee7c2c4e4_Profile%20Pic_Smoker-p-500.jpeg'
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
    html`<wui-transaction-visual
      type=${args.type}
      imageSrc=${ifDefined(args.imageSrc)}
    ></wui-transaction-visual>`
}
