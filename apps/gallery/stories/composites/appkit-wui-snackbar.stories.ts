import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-snackbar'
import type { WuiSnackbar } from '@reown/appkit-ui/wui-snackbar'

type Component = Meta<WuiSnackbar>

export default {
  title: 'Composites/appkit-wui-snackbar',
  args: {
    message: 'Address approved',
    variant: 'success'
  },

  argTypes: {
    variant: {
      options: ['success', 'error', 'warning', 'info', 'loading'],
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html` <wui-snackbar message=${args.message} variant=${args.variant}> </wui-snackbar>`
}
