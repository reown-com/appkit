import type { Meta } from '@storybook/web-components'
import type { W3mPaymentTokenButton } from '@web3modal/scaffold-ui'
import '../../../../packages/scaffold-ui/src/partials/w3m-payment-token-button'
import { html } from 'lit'
import '../../components/gallery-container'
import { networkImageSrc } from '../../utils/PresetUtils'

type Component = Meta<W3mPaymentTokenButton>

export default {
  title: 'Partials/w3m-token-payment-button',
  args: {
    currency: 'ETH',
    imageUrl: networkImageSrc
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<gallery-container width="200" height="100"
      ><w3m-payment-token-button
        currency=${args.currency}
        imageUrl=${args.imageUrl}
      ></w3m-payment-token-button
    ></gallery-container>`
}
