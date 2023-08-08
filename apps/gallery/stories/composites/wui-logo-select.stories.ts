import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-logo-select'
import type { WuiLogoSelect } from '@web3modal/ui/src/composites/wui-logo-select'
import { html } from 'lit'
import { logoOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiLogoSelect>

export default {
  title: 'Composites/wui-logo-select',
  args: {
    logo: 'google',
    disabled: false
  },

  argTypes: {
    logo: {
      options: logoOptions,
      control: { type: 'select' }
    },
    disabled: {
      control: { type: 'boolean' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-logo-select ?disabled=${args.disabled} logo=${args.logo}></wui-logo-select>`
}
