import type { Meta } from '@storybook/web-components'

import { html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'

import '@reown/appkit-ui/wui-text'
import type { WuiText } from '@reown/appkit-ui/wui-text'

import { colorOptions, textAlignOptions, textOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiText>

export default {
  title: 'Components/wui-text',
  args: {
    variant: 'paragraph-500',
    color: 'fg-100'
  },
  argTypes: {
    variant: {
      options: textOptions,
      control: { type: 'select' }
    },
    color: {
      options: colorOptions,
      control: { type: 'select' }
    },
    align: {
      options: textAlignOptions,
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args => html`
    <wui-text variant=${args.variant} color=${args.color} align=${ifDefined(args.align)}>
      The fox jumped over the lazy dog
    </wui-text>
  `
}

export const LineClamp: Component = {
  render: args => html`
    <div style="max-width:300px">
      <wui-text
        variant=${args.variant}
        color=${args.color}
        align=${ifDefined(args.align)}
        lineClamp="1"
      >
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
        been the industry's standard dummy text ever since the 1500s.
      </wui-text>
    </div>
  `
}
