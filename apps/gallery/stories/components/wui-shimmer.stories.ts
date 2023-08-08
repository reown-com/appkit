import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/components/wui-shimmer'
import type { WuiShimmer } from '@web3modal/ui/src/components/wui-shimmer'
import { html } from 'lit'
import { borderRadiusOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiShimmer>

export default {
  title: 'Components/wui-shimmer',
  args: {
    width: '200px',
    height: '50px',
    borderRadius: 's'
  },
  argTypes: {
    borderRadius: {
      options: borderRadiusOptions,
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-shimmer
      width=${args.width}
      height="${args.height}"
      borderRadius=${args.borderRadius}
    ></wui-shimmer>`
}
