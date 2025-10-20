import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@laughingwhales/appkit-ui/wui-card'
import type { WuiCard } from '@laughingwhales/appkit-ui/wui-card'

import '../../components/gallery-placeholder'

type Component = Meta<WuiCard>

export default {
  title: 'Components/appkit-wui-card'
} as Component

export const Default: Component = {
  render: () => html`
    <wui-card>
      <gallery-placeholder size="lg" margin background="blue"></gallery-placeholder>
    </wui-card>
  `
}
