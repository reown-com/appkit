import type { Meta } from '@storybook/web-components'
import '@reown/appkit-ui-new/src/composites/wui-tag'
import type { WuiTag } from '@reown/appkit-ui-new/src/composites/wui-tag'
import { html } from 'lit'
import { iconOptions, tagOptions } from '../../utils/PresetUtils'
import { ifDefined } from 'lit/directives/if-defined.js'

type Component = Meta<WuiTag>

export default {
  title: 'Components/Tag',
  args: {
    variant: 'accent',
    size: 'md',
    icon: undefined
  },
  argTypes: {
    variant: {
      options: tagOptions,
      control: { type: 'select' }
    },
    size: {
      options: ['md', 'sm'],
      control: { type: 'select' }
    },
    icon: {
      options: [undefined, ...iconOptions],
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args => html`
    <wui-tag icon=${ifDefined(args.icon)} size=${args.size} variant=${args.variant}>
      Recent
    </wui-tag>
  `
}
