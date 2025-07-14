import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import type { WuiEnsInput } from '@reown/appkit-ui/wui-ens-input'
import '@reown/appkit-ui/wui-ens-input'

import '../../components/gallery-container'

type Component = Meta<WuiEnsInput>

export default {
  title: 'Composites/appkit-wui-ens-input',
  args: {
    errorMessage: '',
    disabled: false
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<gallery-container width="336"
      ><wui-ens-input .errorMessage=${args.errorMessage} .disabled=${args.disabled}></wui-ens-input
    ></gallery-container>`
}
