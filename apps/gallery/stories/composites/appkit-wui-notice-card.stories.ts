import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-notice-card'
import type { WuiNoticeCard } from '@reown/appkit-ui/wui-notice-card'

import '../../components/gallery-container'
import { iconOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiNoticeCard>

export default {
  title: 'Composites/appkit-wui-notice-card',
  args: {
    label: 'Enjoy all your wallet potential',
    description: 'Switch to a Non Custodial Wallet in a minute',
    icon: 'wallet'
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
    <gallery-container width="340">
      <wui-notice-card
        label=${args.label}
        description=${args.description}
        icon=${args.icon}
      ></wui-notice-card>
    </gallery-container>
  `
}
