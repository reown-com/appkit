import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-details-group'
import type { WuiDetailsGroupItem } from '@reown/appkit-ui/wui-details-group-item'
import '@reown/appkit-ui/wui-list-item'

import '../../components/gallery-container'

type Component = Meta<WuiDetailsGroupItem>

export default {
  title: 'Composites/appkit-wui-details-group-item',
  args: {
    name: 'Sending'
  },
  argTypes: {
    name: { control: { type: 'text' } }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<gallery-container width="336">
      <wui-details-group>
        <wui-details-group-item name=${args.name}>
          <wui-text variant="md-medium" color="primary">2 AVAX</wui-text>
        </wui-details-group-item>
      </wui-details-group>
    </gallery-container>`
}
