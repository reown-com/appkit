import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-select'
import type { WuiSelect } from '@reown/appkit-ui/wui-select'

import '../../components/gallery-container'

type Component = Meta<WuiSelect>

export default {
  title: 'Composites/appkit-wui-select',
  parameters: {
    chromatic: { disableSnapshot: true }
  },
  args: {
    imageSrc: 'https://picsum.photos/200/300',
    text: 'Text',
    disabled: false,
    size: 'lg',
    type: 'filled-dropdown'
  },
  argTypes: {
    imageSrc: {
      control: { type: 'text' },
      table: {
        defaultValue: {
          detail: 'https://picsum.photos/200/300'
        }
      }
    },
    text: {
      control: { type: 'text' },
      table: {
        defaultValue: {
          detail: 'Text'
        }
      }
    },
    disabled: {
      control: { type: 'boolean' }
    },
    size: {
      options: ['lg', 'md', 'sm'],
      control: { type: 'select' }
    },
    type: {
      options: ['filled-dropdown', 'text-dropdown'],
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<gallery-container width="336">
      <wui-select
        imageSrc=${args.imageSrc}
        text=${args.text}
        ?disabled=${args.disabled}
        size=${args.size}
        type=${args.type}
      ></wui-select>
    </gallery-container>`
}
