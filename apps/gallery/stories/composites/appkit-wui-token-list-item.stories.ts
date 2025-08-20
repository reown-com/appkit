import type { Meta } from '@storybook/web-components'

import { html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'

import '@reown/appkit-ui/wui-token-list-item'
import type { WuiTokenListItem } from '@reown/appkit-ui/wui-token-list-item'

import '../../components/gallery-container'
import { networkImageSrc } from '../../utils/PresetUtils'

type Component = Meta<WuiTokenListItem>

export default {
  title: 'Composites/apkt-token-list-item',
  args: {
    name: 'Ethereum',
    symbol: 'ETH',
    price: '1740.72',
    amount: '0.867',
    imageSrc: networkImageSrc
  }
} as Component

export const Default: Component = {
  render: args =>
    html` <gallery-container width="336">
      <wui-token-list-item
        name=${ifDefined(args.name)}
        symbol=${ifDefined(args.symbol)}
        price=${ifDefined(args.price)}
        amount=${ifDefined(args.amount)}
        imageSrc=${ifDefined(args.imageSrc)}
      ></wui-token-list-item>
    </gallery-container>`
}
