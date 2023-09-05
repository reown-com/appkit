import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/components/wui-loading-spinner'
import type { WuiLoadingSpinner } from '@web3modal/ui/src/components/wui-loading-spinner'
import { html } from 'lit'
import { colorOptions } from '../../utils/PresetUtils'

type Component = Meta<WuiLoadingSpinner>

export default {
  title: 'Components/wui-loading-spinner',
  args: {
    color: 'accent-100',
    size: 'lg'
  },
  argTypes: {
    size: {
      options: ['sm', 'md', 'lg'],
      control: { type: 'select' }
    },
    color: {
      options: colorOptions,
      control: { type: 'select' }
    }
  }
} as Component

export const Default: Component = {
  render: args => html`
    <wui-loading-spinner size=${args.size} color=${args.color}></wui-loading-spinner>
  `
}
