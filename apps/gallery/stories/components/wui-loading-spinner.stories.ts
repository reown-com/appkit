import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/components/wui-loading-spinner'
import type { WuiLoadingSpinner } from '@web3modal/ui/src/components/wui-loading-spinner'
import { html } from 'lit'

type Component = Meta<WuiLoadingSpinner>

export default {
  title: 'Components/wui-loading-spinner'
} as Component

export const Default: Component = {
  render: () => html` <wui-loading-spinner></wui-loading-spinner> `
}
