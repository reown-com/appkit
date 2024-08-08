import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-list-token'
import type { WuiListToken } from '@web3modal/ui/src/composites/wui-list-token'
import { html } from 'lit'
import '../../components/gallery-container'
import { networkImageSrc } from '../../utils/PresetUtils'

type Component = Meta<WuiListToken>

export default {
  title: 'Composites/wui-list-token',
  args: {
    tokenName: 'Ethereum',
    tokenImageUrl: networkImageSrc,
    tokenValue: '$1,740.72',
    tokenAmount: 0.867,
    tokenCurrency: 'ETH'
  }
} as Component

export const Default: Component = {
  render: args =>
    html` <gallery-container width="336">
      <wui-list-token
        tokenName=${args.tokenName}
        tokenImageUrl=${args.tokenImageUrl}
        tokenValue=${args.tokenValue}
        tokenAmount=${args.tokenAmount}
        tokenCurrency=${args.tokenCurrency}
      ></wui-list-token>
    </gallery-container>`
}
