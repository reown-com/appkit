import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-list-select'
import '../../components/gallery-container'
import type { WuiListSelect } from '@web3modal/ui/src/composites/wui-list-select'
import { html } from 'lit'
import { walletImagesOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiListSelect>

export default {
  title: 'Composites/wui-list-select',
  args: {
    walletImages: walletImagesOptions,
    imageSrc: walletImagesOptions[0].src,
    name: 'Rainbow',
    showAllWallets: false,
    status: 'recent',
    disabled: false
  },
  argTypes: {
    showAllWallets: {
      control: { type: 'boolean' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html` <gallery-container width="336">
      <wui-list-select
        .imageSrc=${args.imageSrc}
        .walletImages=${args.walletImages}
        .showAllWallets=${args.showAllWallets}
        .status=${args.status}
        ?disabled=${args.disabled}
        name=${args.name}
      ></wui-list-select>
    </gallery-container>`
}
