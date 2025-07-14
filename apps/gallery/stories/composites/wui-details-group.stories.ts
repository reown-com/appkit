import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import { UiHelperUtil } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-chip'
import type { WuiDetailsGroup } from '@reown/appkit-ui/wui-details-group'
import '@reown/appkit-ui/wui-details-group-item'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-image'
import '@reown/appkit-ui/wui-text'

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
        <wui-details-group-item name="Sending">
          <wui-text variant="md-regular" color="primary">2 AVAX</wui-text>
        </wui-details-group-item>
        <wui-details-group-item name="To">
          <wui-chip
            href=${'https://www.reown.com'}
            title=${UiHelperUtil.getTruncateString({
              string: '0x276...f0ed7',
              truncate: 'middle',
              charsStart: 4,
              charsEnd: 4
            })}
            variant="transparent"
          />
        </wui-details-group-item>
      </wui-details-group>
    </gallery-container>
  `
}
