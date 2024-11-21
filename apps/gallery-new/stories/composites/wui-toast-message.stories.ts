import type { Meta } from '@storybook/web-components'
import '@reown/appkit-ui-new/src/composites/wui-toast-message'
import '../../components/gallery-container'
import type { WuiToastMessage } from '@reown/appkit-ui-new/src/composites/wui-toast-message'
import { html } from 'lit'
import { colorOptions, iconOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiToastMessage>

export default {
  title: 'Composites/wui-toast-message',
  args: {
    message: 'Alert',
    backgroundColor: 'fg-350',
    iconColor: 'fg-325',
    icon: 'info'
  },
  argTypes: {
    backgroundColor: {
      options: colorOptions,
      control: { type: 'select' }
    },
    iconColor: {
      options: colorOptions,
      control: { type: 'select' }
    },
    icon: {
      options: iconOptions,
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args => html`
    <gallery-container width="336">
      <wui-toast-message
        iconColor=${args.iconColor}
        backgroundColor=${args.backgroundColor}
        icon=${args.icon}
        message=${args.message}
      >
      </wui-toast-message>
    </gallery-container>
  `
}
