import type { Meta } from '@storybook/web-components'
import '@reown/appkit-ui/src/composites/wui-list-item'
import type { WuiDetailsGroupItem } from '@reown/appkit-ui/src/composites/wui-details-group-item'
import { html } from 'lit'
import '../../components/gallery-container'

type Component = Meta<WuiDetailsGroupItem>

export default {
  title: 'Composites/wui-details-group-item',
  args: {
    name: 'Title'
  },
  argTypes: {
    name: { control: { type: 'text' } }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<gallery-container width="336">
      <wui-details-group-item name=${args.name}> </wui-details-group-item>
    </gallery-container>`
}
