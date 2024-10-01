import type { Meta } from '@storybook/web-components'
import '@reown/appkit-ui/src/composites/wui-list-token'
import type { WuiListAccount } from '@reown/appkit-ui/src/composites/wui-list-account'
import { html } from 'lit'
import '../../components/gallery-container'
import { networkImageSrc } from '../../utils/PresetUtils'

type Component = Meta<WuiListAccount>

export default {
  title: 'Composites/wui-list-account',
  args: {
    address: 'Ethereum',
    addressDescription: 'some ens',
    logo: networkImageSrc
  }
} as Component

export const Default: Component = {
  render: args =>
    html` <gallery-container width="336">
      <wui-list-account
        address=${args.address}
        addressDescription=${args.addressDescription}
        logo=${args.logo}
      ></wui-list-account>
    </gallery-container>`
}
