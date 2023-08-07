import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-snackbar'
import type { WuiSnackbar } from '@web3modal/ui/src/composites/wui-snackbar'
import { html } from 'lit'
import { colorOptions, iconOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiSnackbar>

export default {
  title: 'Composites/wui-snackbar',
  args: {
    message: 'Address approved',
    backgroundColor: 'success-100',
    iconColor: 'success-100',
    icon: 'checkmark'
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
  render: args =>
    html` <wui-snackbar
      iconColor=${args.iconColor}
      backgroundColor=${args.backgroundColor}
      icon=${args.icon}
      message=${args.message}
    >
    </wui-snackbar>`
}
