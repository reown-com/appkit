import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-email-input'
import type { WuiEmailInput } from '@reown/appkit-ui/wui-email-input'

import '../../components/gallery-container'

type Component = Meta<WuiEmailInput>

export default {
  title: 'Composites/wui-email-input',
  args: {
    errorMessage: ''
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<gallery-container width="336"
      ><wui-email-input .errorMessage=${args.errorMessage}></wui-email-input
    ></gallery-container>`
}
