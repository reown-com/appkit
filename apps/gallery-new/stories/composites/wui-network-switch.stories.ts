import type { Meta } from '@storybook/web-components'
import '@reown/appkit-ui-new/src/composites/wui-network-switch'
import type { WuiNetworkSwitch } from '@reown/appkit-ui-new/src/composites/wui-network-switch'
import { html } from 'lit'
import { iconOptions, networkImageSrc } from '../../utils/PresetUtils'

type Component = Meta<WuiNetworkSwitch>

export default {
  title: 'Composites/wui-network-switch',
  args: {
    imageSrc: networkImageSrc,
    icon: 'networkPlaceholder',
    size: 'md',
    disabled: false
  },
  argTypes: {
    imageSrc: {
      control: { type: 'text' }
    },
    icon: {
      options: iconOptions,
      control: { type: 'select' }
    },
    size: {
      options: ['sm', 'md', 'lg'],
      control: { type: 'select' }
    },
    disabled: {
      control: { type: 'boolean' },
      variant: { type: 'boolean' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-network-switch
      ?disabled=${args.disabled}
      imageSrc=${args.imageSrc}
      icon=${args.icon}
      size=${args.size}
      >Network</wui-network-switch
    >`
}
