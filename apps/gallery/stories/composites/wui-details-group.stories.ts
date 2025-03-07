import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-cta-button'
import type { WuiDetailsGroup } from '@reown/appkit-ui/wui-details-group'

import '../../components/gallery-container'

type Component = Meta<WuiDetailsGroup>

export default {
  title: 'Composites/wui-details-group',
  args: {}
} as Component

export const Default: Component = {
  render: () => html`
    <gallery-container width="336">
      <wui-details-group>
        <wui-details-group-item name=${'Sending'}>
          <wui-text variant="paragraph-400" color="fg-100">2 AVAX</wui-text>
        </wui-details-group-item>
        <wui-details-group-item name=${'To'}>
          <wui-text variant="paragraph-400" color="fg-100">0x276...f0ed7</wui-text>
        </wui-details-group-item>
      </wui-details-group>
    </gallery-container>
  `
}
