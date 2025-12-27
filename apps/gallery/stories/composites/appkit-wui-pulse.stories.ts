import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-pulse'
import type { WuiPulse } from '@reown/appkit-ui/wui-pulse'

type Component = Meta<WuiPulse>

export default {
  title: 'Composites/appkit-wui-pulse',
  args: {
    rings: 3,
    duration: 2,
    opacity: 0.3,
    size: '200px',
    variant: 'accent-primary'
  }
} as Component

export const Default: Component = {
  render: args => html`
    <wui-pulse
      rings=${args.rings}
      duration=${args.duration}
      opacity=${args.opacity}
      size=${args.size}
      variant=${args.variant}
    >
    </wui-pulse>
  `
}
