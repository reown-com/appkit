import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-token-button'
import type { WuiTokenButton } from '@reown/appkit-ui/wui-token-button'

import { networkImageSrc } from '../../utils/PresetUtils'

type Component = Meta<WuiTokenButton>

export default {
  title: 'Composites/appkit-wui-token-button',
  args: {
    text: 'ETH',
    imageSrc: networkImageSrc,
    size: 'md',
    disabled: false
  },
  argTypes: {
    size: {
      options: ['lg', 'md', 'sm'],
      control: { type: 'select' }
    },
    text: {
      control: { type: 'text' }
    },
    imageSrc: {
      control: { type: 'text' }
    },
    chainImageSrc: {
      control: { type: 'text' }
    },
    disabled: {
      control: { type: 'boolean' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-token-button
      text=${args.text}
      .imageSrc=${args.imageSrc}
      .chainImageSrc=${args.chainImageSrc}
      size=${args.size}
      ?disabled=${args.disabled}
    >
      Recent
    </wui-token-button>`
}
