import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-select'
import type { WuiSelect } from '@reown/appkit-ui/wui-select'

import { networkImageSrc } from '../../utils/PresetUtils'

type Component = Meta<WuiSelect>

export default {
  title: 'Composites/wui-select',
  args: {
    imageSrc: networkImageSrc
  }
} as Component

export const Default: Component = {
  render: args => html`<wui-select imageSrc=${args.imageSrc}></wui-select>`
}
