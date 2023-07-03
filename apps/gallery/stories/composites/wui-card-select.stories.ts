import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-card-select'
import '../../components/gallery-container'
import type { WuiCardSelect } from '@web3modal/ui/src/composites/wui-card-select'
import { html } from 'lit'

type Component = Meta<WuiCardSelect>

export default {
  title: 'Composites/wui-card-select',
  args: {
    imageSrc:
      'https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/7a33d7f1-3d12-4b5c-f3ee-5cd83cb1b500?projectId=a8d876c6f91c3748db621583fad358f1',
    name: 'Rainbow',
    disabled: false
  }
} as Component

export const Default: Component = {
  render: args => html`
    <gallery-container width="76"
      ><wui-card-select
        imageSrc=${args.imageSrc}
        ?disabled=${args.disabled}
        name=${args.name}
      ></wui-card-select>
    </gallery-container>
  `
}
