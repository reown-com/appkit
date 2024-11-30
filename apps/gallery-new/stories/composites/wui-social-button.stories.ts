import type { Meta } from '@storybook/web-components'
import '@reown/appkit-ui-new/src/composites/wui-social-button'
import type { WuiSocialButton } from '@reown/appkit-ui-new/src/composites/wui-social-button'
import { html } from 'lit'
import '../../components/gallery-container'
import { socialsIconOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiSocialButton>

export default {
  title: 'Composites/wui-social-button',
  args: {
    icon: 'google',
    disabled: false
  },
  argTypes: {
    icon: {
      icon: socialsIconOptions,
      control: { type: 'select' }
    },
    disabled: {
      control: { type: 'boolean' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<gallery-container width="60"
      ><wui-social-button ?disabled=${args.disabled} icon=${args.icon}></wui-social-button>
    </gallery-container>`
}
