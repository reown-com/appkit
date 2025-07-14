import type { Meta } from '@storybook/web-components'

import { html } from 'lit'

import '@reown/appkit-ui/wui-banner'
import type { WuiBanner } from '@reown/appkit-ui/wui-banner'

import '../../components/gallery-container'
import { iconOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiBanner>

export default {
  title: 'Composites/wui-banner',
  args: {
    text: 'You can only receive assets on these networks',
    icon: 'warningCircle'
  },
  argTypes: {
    icon: {
      options: iconOptions,
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html` <gallery-container width="336"
      ><wui-banner icon=${args.icon} text=${args.text}></wui-banner
    ></gallery-container>`
}
