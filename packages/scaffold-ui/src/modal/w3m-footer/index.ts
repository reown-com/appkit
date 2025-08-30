import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import { EventsController, RouterController } from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'

import '../../partials/w3m-legal-footer/index.js'
import '../../partials/w3m-onramp-providers-footer/index.js'
import { HelpersUtil } from '../../utils/HelpersUtil.js'
import styles from './styles.js'

@customElement('w3m-footer')
export class W3mFooter extends LitElement {
  public static override styles = [styles]

  // -- Members ------------------------------------------- //
  private resizeObserver?: ResizeObserver = undefined

  private unsubscribe: (() => void)[] = []

  @state() private status: 'hide' | 'show' = 'hide'

  // -- State & Properties -------------------------------- //
  @state() private view = RouterController.state.view

  public override firstUpdated() {
    this.status = HelpersUtil.hasFooter() ? 'show' : 'hide'

    this.unsubscribe.push(
      RouterController.subscribeKey('view', val => {
        this.view = val
        this.status = HelpersUtil.hasFooter() ? 'show' : 'hide'
        if (this.status === 'hide') {
          const globalStyles = document.documentElement.style
          globalStyles.setProperty('--apkt-footer-height', '0px')
        }
      })
    )

    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target === this.getWrapper()) {
          const newHeight = `${entry.contentRect.height}px`
          const globalStyles = document.documentElement.style
          globalStyles.setProperty('--apkt-footer-height', newHeight)
        }
      }
    })

    this.resizeObserver.observe(this.getWrapper())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <div class="container" status=${this.status}>${this.templatePageContainer()}</div>
    `
  }

  // -- Private ------------------------------------------- //

  private templatePageContainer() {
    if (HelpersUtil.hasFooter()) {
      return html` ${this.templateFooter()}`
    }

    return null
  }

  private templateFooter() {
    switch (this.view) {
      case 'Networks':
        return this.templateNetworksFooter()
      case 'Connect':
      case 'ConnectWallets':
      case 'OnRampFiatSelect':
      case 'OnRampTokenSelect':
        return html`<w3m-legal-footer></w3m-legal-footer>`
      case 'OnRampProviders':
        return html`<w3m-onramp-providers-footer></w3m-onramp-providers-footer>`
      default:
        return null
    }
  }

  private templateNetworksFooter() {
    return html` <wui-flex
      class="footer-in"
      padding="3"
      flexDirection="column"
      gap="3"
      alignItems="center"
    >
      <wui-text variant="md-regular" color="secondary" align="center">
        Your connected wallet may not support some of the networks available for this dApp
      </wui-text>
      <wui-link @click=${this.onNetworkHelp.bind(this)}>
        <wui-icon size="sm" color="accent-primary" slot="iconLeft" name="helpCircle"></wui-icon>
        What is a network
      </wui-link>
    </wui-flex>`
  }

  private onNetworkHelp() {
    EventsController.sendEvent({ type: 'track', event: 'CLICK_NETWORK_HELP' })
    RouterController.push('WhatIsANetwork')
  }

  private getWrapper() {
    return this.shadowRoot?.querySelector('div.container') as HTMLElement
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-footer': W3mFooter
  }
}
