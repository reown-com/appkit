import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-loading-spinner'
import type { WuiLoadingSpinner } from '@reown/appkit-ui/wui-loading-spinner'

import { textColorOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiLoadingSpinner>

export default {
  title: 'Composites/appkit-wui-loading-spinner',
  parameters: {
    chromatic: { disableSnapshot: true }
  },
  args: {
    color: 'accent-primary',
    size: 'lg'
  },
  argTypes: {
    size: {
      options: ['sm', 'md', 'lg'],
      control: { type: 'select' }
    },
    color: {
      options: textColorOptions,
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args => html`
    <wui-loading-spinner size=${args.size} color=${args.color}></wui-loading-spinner>
  `
}
