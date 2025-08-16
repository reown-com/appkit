import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-compatible-network'
import type { WuiCompatibleNetwork } from '@reown/appkit-ui/wui-compatible-network'

import { networkImages } from '../../utils/PresetUtils'

type Component = Meta<WuiCompatibleNetwork>

export default {
  title: 'Composites/appkit-wui-compatible-network',
  args: {
    text: 'Only receive assets on these networks"',
    networkImages
  }
} as Component

export const Default: Component = {
  render: args => html`
    <wui-compatible-network .networkImages=${args.networkImages} .text=${args.text}>
    </wui-compatible-network>
  `
}
