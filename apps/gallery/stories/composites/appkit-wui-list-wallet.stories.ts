import type { Meta } from '@storybook/web-components'

import { html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'

import '@reown/appkit-ui/wui-list-wallet'
import type { WuiListWallet } from '@reown/appkit-ui/wui-list-wallet'

import '../../components/gallery-container'
import { iconOptions, tagOptions, walletImageSrc } from '../../utils/PresetUtils'

type Component = Meta<WuiListWallet>

export default {
  title: 'Composites/appkit-wui-list-wallet',
  args: {
    name: 'MetaMask',
    imageSrc: walletImageSrc,
    tagLabel: 'Recent',
    tagVariant: 'accent',
    disabled: false,
    loading: false,
    showAllWallets: false,
    size: 'md'
  },
  argTypes: {
    tagVariant: {
      options: tagOptions,
      control: { type: 'select' }
    },
    icon: {
      options: [undefined, ...iconOptions],
      control: { type: 'select' }
    },
    size: {
      options: ['sm', 'md'],
      control: { type: 'select' }
    },
    installed: {
      control: { type: 'boolean' }
    },
    disabled: {
      control: { type: 'boolean' }
    },
    loading: {
      control: { type: 'boolean' }
    },
    showAllWallets: {
      control: { type: 'boolean' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html` <gallery-container width="336">
      <wui-list-wallet
        name=${args.name}
        imageSrc=${ifDefined(args.imageSrc)}
        tagLabel=${ifDefined(args.tagLabel)}
        tagVariant=${ifDefined(args.tagVariant)}
        size=${ifDefined(args.size)}
        ?disabled=${args.disabled}
        ?loading=${args.loading}
        ?showAllWallets=${args.showAllWallets}
      ></wui-list-wallet>
    </gallery-container>`
}
