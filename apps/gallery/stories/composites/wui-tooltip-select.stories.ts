import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-wallet-feature-button'
import type { WuiWalletFeatureButton } from '@web3modal/ui/src/composites/wui-wallet-feature-button'
import { html } from 'lit'
import '../../components/gallery-container'
import { iconOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiWalletFeatureButton>

export default {
  title: 'Composites/wui-wallet-feature-button',
  args: {
    icon: 'card',
    text: 'Buy'
  },
  argTypes: {
    icon: {
      options: iconOptions,
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args => html`
    <gallery-container width="120">
      <wui-wallet-feature-button icon=${args.icon} text=${args.text}></wui-wallet-feature-button>
    </gallery-container>
  `
}
