import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-checkbox'
import type { WuiCheckBox } from '@reown/appkit-ui/wui-checkbox'
import '@reown/appkit-ui/wui-icon'
import '@reown/appkit-ui/wui-text'

type Component = Meta<WuiCheckBox>

export default {
  title: 'Composites/wui-checkbox',
  args: {
    checked: false,
    termsConditionsUrl: 'https://www.google.com',
    privacyPolicyUrl: 'https://www.google.com',
    legalCheckbox: false
  },
  argTypes: {
    checked: {
      control: { type: 'boolean' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-checkbox ?checked=${args.checked}>
      <wui-text color="fg-250" variant="small-400" align="left">
        I agree to our
        <a rel="noreferrer" target="_blank" href="https://reown.com">
          <wui-text color="fg-200">terms of service</wui-text>
        </a>
        and
        <a rel="noreferrer" target="_blank" href="https://reown.com">
          <wui-text color="fg-200">privacy policy</wui-text>
        </a>
      </wui-text>
    </wui-checkbox>`
}
