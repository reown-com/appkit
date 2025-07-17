import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-input-text'
import type { WuiInputText } from '@reown/appkit-ui/wui-input-text'

import '../../components/gallery-container'
import { iconOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiInputText>

export default {
  title: 'Composites/wui-input-text',
  args: {
    size: 'sm',
    placeholder: 'Search wallet',
    icon: 'search',
    disabled: false
  },
  argTypes: {
    size: {
      options: ['sm', 'md', 'lg'],
      control: { type: 'select' }
    },
    disabled: {
      control: { type: 'boolean' }
    },
    icon: {
      options: [undefined, ...iconOptions],
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<gallery-container width="336">
      <wui-input-text
        size=${args.size}
        placeholder=${args.placeholder}
        ?disabled=${args.disabled}
        .icon=${args.icon}
      ></wui-input-text
    ></gallery-container>`
}
