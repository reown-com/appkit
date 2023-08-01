import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-account-button'
import type { WuiAccountButton } from '@web3modal/ui/src/composites/wui-account-button'
import { html } from 'lit'
import { networkImageSrc, address } from '../../utils/PresetUtils'

type Component = Meta<WuiAccountButton>

export default {
  title: 'Composites/wui-account-button',
  args: {
    imageSrc: networkImageSrc,
    address,
    balance: '0.527 ETH'
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-account-button
      .imageSrc=${args.imageSrc}
      .balance=${args.balance}
      address=${args.address}
    ></wui-account-button>`
}
