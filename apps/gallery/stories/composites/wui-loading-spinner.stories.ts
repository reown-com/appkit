import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-loading-spinner'
import type { WuiLoadingSpinner } from '@web3modal/ui/src/composites/wui-loading-spinner'
import { html } from 'lit'

type Component = Meta<WuiLoadingSpinner>

export default {
  title: 'Composites/wui-loading-spinner',
  args: {
    loading: true
  }
} as Component

export const Default: Component = {
  render: args => html` <wui-loading-spinner ?loading=${args.loading}></wui-loading-spinner> `
}
