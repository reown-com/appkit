import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-notice-card'
import type { WuiNoticeCard } from '@web3modal/ui/src/composites/wui-notice-card'
import { html } from 'lit'
import '../../components/gallery-container'

type Component = Meta<WuiNoticeCard>

export default {
  title: 'Composites/wui-notice-card',
  args: {},
  argTypes: {}
} as Component

export const Default: Component = {
  render: args => html`
    <gallery-container width="336">
      <wui-notice-card></wui-notice-card>
    </gallery-container>
  `
}
