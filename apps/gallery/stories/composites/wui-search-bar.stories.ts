import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-search-bar'
import type { WuiSearchBar } from '@web3modal/ui/src/composites/wui-search-bar'
import '../../components/gallery-container'
import { html } from 'lit'

type Component = Meta<WuiSearchBar>

export default {
  title: 'Composites/wui-search-bar'
} as Component

export const Default: Component = {
  render: () =>
    html`<gallery-container width="336"><wui-search-bar></wui-search-bar></gallery-container>`
}
