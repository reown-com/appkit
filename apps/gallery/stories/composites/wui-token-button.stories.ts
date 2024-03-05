import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-tag'
import type { WuiTag } from '@web3modal/ui/src/composites/wui-tag'
import { html } from 'lit'

type Component = Meta<WuiTag>

export default {
  title: 'Composites/wui-token-button',
  args: {
    symbol: 'ETH',
    logoURI: 'https://tokens-data.1inch.io/images/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png'
  },
  argTypes: {
    symbol: {
      type: 'string'
    },
    logoURI: {
      type: 'string'
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-token-button text=${args.symbol} logoURI=${args.logoURI}>Recent</wui-token-button>`
}
