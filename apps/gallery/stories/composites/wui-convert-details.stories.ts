import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-list-item'
import type { WuiConvertDetails } from '@web3modal/ui/src/composites/wui-convert-details'
import { html } from 'lit'
import '../../components/gallery-container'

type Component = Meta<WuiConvertDetails>

export default {
  title: 'Composites/wui-convert-details',
  args: {
    detailsOpen: true,
    sourceTokenSymbol: 'MATIC',
    sourceTokenPrice: 1.5,
    toTokenSymbol: 'USDC',
    toTokenConvertedAmount: 1.5,
    gasPriceInUSD: 0.0001,
    priceImpact: 0.5,
    slippageRate: 0.5,
    maxSlippage: 0.5
  },
  argTypes: {}
} as Component

export const Default: Component = {
  render: args =>
    html`<gallery-container width="336">
      <wui-convert-details
        detailsOpen=${args.detailsOpen}
        sourceTokenSymbol=${args.sourceTokenSymbol}
        sourceTokenPrice=${args.sourceTokenPrice}
        toTokenSymbol=${args.toTokenSymbol}
        toTokenConvertedAmount=${args.toTokenConvertedAmount}
        gasPriceInUSD=${args.gasPriceInUSD}
        priceImpact=${args.priceImpact}
        slippageRate=${args.slippageRate}
        maxSlippage=${args.maxSlippage}
      >
      </wui-convert-details>
    </gallery-container>`
}
