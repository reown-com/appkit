import {
  AccountController,
  ConnectionController,
  ConnectorController,
  ModalController,
  ThemeController
} from '@web3modal/core'
import { UiHelperUtil, customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import styles from './styles.js'

@customElement('w3m-connecting-social-view')
export class W3mConnectingSocialView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private socialProvider = AccountController.state.socialProvider

  @state() protected error = false

  public authConnector = ConnectorController.getAuthConnector()

  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        AccountController.subscribe(val => {
          if (val.socialProvider) {
            this.socialProvider = val.socialProvider
          }
        })
      ]
    )
    if (this.authConnector) {
      this.connectSocial()
    }
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex
        data-error=${ifDefined(this.error)}
        flexDirection="column"
        alignItems="center"
        .padding=${['3xl', 'xl', 'xl', 'xl'] as const}
        gap="xl"
      >
        <wui-flex justifyContent="center" alignItems="center">
          <wui-logo logo=${ifDefined(this.socialProvider)}></wui-logo>

          ${this.error ? null : this.loaderTemplate()}

          <wui-icon-box
            backgroundColor="error-100"
            background="opaque"
            iconColor="error-100"
            icon="close"
            size="sm"
            border
            borderColor="wui-color-bg-125"
          ></wui-icon-box>
        </wui-flex>
        <wui-flex flexDirection="column" alignItems="center" gap="xs">
          <wui-text align="center" variant="paragraph-500" color="fg-100"
            >Log in with
            ${this.socialProvider
              ? UiHelperUtil.capitalizeFirstLetter(this.socialProvider)
              : 'Social'}</wui-text
          >
          <wui-text align="center" variant="small-400" color=${this.error ? 'error-100' : 'fg-200'}
            >${this.error ? 'Something went wrong' : 'Connect in the provider window'}</wui-text
          ></wui-flex
        >
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private loaderTemplate() {
    const borderRadiusMaster = ThemeController.state.themeVariables['--w3m-border-radius-master']
    const radius = borderRadiusMaster ? parseInt(borderRadiusMaster.replace('px', ''), 10) : 4

    return html`<wui-loading-thumbnail radius=${radius * 9}></wui-loading-thumbnail>`
  }

  private connectSocial() {
    const handleSocialConnection = async (event: MessageEvent) => {
      if (event.data?.resultUri) {
        try {
          if (this.authConnector) {
            const uri = event.data.resultUri as string

            await this.authConnector.provider.connectSocial(uri)
            await ConnectionController.connectExternal(this.authConnector)
            ModalController.close()
          }
        } catch (error) {
          this.error = true
        }
      }
    }

    window.addEventListener('message', handleSocialConnection, false)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-social-view': W3mConnectingSocialView
  }
}
