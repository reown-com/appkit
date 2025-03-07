import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import { type SwapInputTarget } from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-shimmer'

import styles from './styles.js'

@customElement('w3m-swap-input-skeleton')
export class W3mSwapInputSkeleton extends LitElement {
  public static override styles = [styles]

  // -- State & Properties -------------------------------- //
  @property() public target: SwapInputTarget = 'sourceToken'

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex class justifyContent="space-between">
        <wui-flex
          flex="1"
          flexDirection="column"
          alignItems="flex-start"
          justifyContent="center"
          class="swap-input"
          gap="xxs"
        >
          <wui-shimmer width="80px" height="40px" borderRadius="xxs" variant="light"></wui-shimmer>
        </wui-flex>
        ${this.templateTokenSelectButton()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private templateTokenSelectButton() {
    return html`
      <wui-flex
        class="swap-token-button"
        flexDirection="column"
        alignItems="flex-end"
        justifyContent="center"
        gap="xxs"
      >
        <wui-shimmer width="80px" height="40px" borderRadius="3xl" variant="light"></wui-shimmer>
      </wui-flex>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-swap-input-skeleton': W3mSwapInputSkeleton
  }
}
