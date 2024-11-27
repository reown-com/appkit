import type { Meta } from '@storybook/web-components'
import '@reown/appkit-ui-new/src/composites/wui-list-select-wallet'
import type { WuiListSelectWallet } from '@reown/appkit-ui-new/src/composites/wui-list-select-wallet'
import { html } from 'lit'
import '../../components/gallery-container'
import { iconOptions, tagOptions, walletImagesOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiListSelectWallet>

export default {
  title: 'Composites/wui-list-select-wallet',
  args: {
    imageSrc: walletImagesOptions[0]?.src,
    name: 'MetaMask',
    variant: 'primary',
    tagLabel: 'LABEL',
    tagVariant: 'accent',
    icon: undefined,
    disabled: false
  },
  argTypes: {
    imageSrc: {
      control: { type: 'text' }
    },
    name: {
      control: { type: 'text' }
    },
    variant: {
      options: ['primary', 'secondary'],
      control: { type: 'select' }
    },
    tagLabel: {
      control: { type: 'text' }
    },
    tagVariant: {
      options: tagOptions,
      control: { type: 'select' }
    },
    icon: {
      options: iconOptions,
      control: { type: 'select' }
    },
    disabled: {
      control: { type: 'boolean' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<gallery-container width="328">
      <wui-list-select-wallet
        .imageSrc=${args.imageSrc}
        .tagLabel=${args.tagLabel}
        .tagVariant=${args.tagVariant}
        .icon=${args.icon}
        .variant=${args.variant}
        name=${args.name}
        ?disabled=${args.disabled}
      ></wui-list-select-wallet>
    </gallery-container>`
}
