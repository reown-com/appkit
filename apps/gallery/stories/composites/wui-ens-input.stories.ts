import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-ens-input'
import type { WuiEnsInput } from '@web3modal/ui'
import { html } from 'lit'
import '../../components/gallery-container'

type Component = Meta<WuiEnsInput>

export default {
  title: 'Composites/wui-email-input',
  args: {
    errorMessage: '',
    disabled: false
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<gallery-container width="336"
      ><wui-email-input .errorMessage=${args.errorMessage}></wui-email-input
    ></gallery-container>`
}
