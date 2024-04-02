import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-list-token'
import type { WuiListAddress } from '@web3modal/ui/src/composites/wui-list-address'
import { html } from 'lit'
import '../../components/gallery-container'
import { networkImageSrc } from '../../utils/PresetUtils'

type Component = Meta<WuiListAddress>

export default {
  title: 'Composites/wui-list-address',
  args: {
    address: 'Ethereum',
    addressDescription: 'some ens',
    logo: networkImageSrc
  }
} as Component

export const Default: Component = {
  render: args =>
    html` <gallery-container width="336">
      <wui-list-address
        address=${args.address}
        addressDescription=${args.addressDescription}
        logo=${args.logo}
      ></wui-list-address>
    </gallery-container>`
}
