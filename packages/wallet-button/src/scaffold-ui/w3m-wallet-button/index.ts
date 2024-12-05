/* eslint-disable max-depth */
import { html, LitElement } from 'lit'
import { property, state } from 'lit/decorators.js'
import { customElement } from '@reown/appkit-ui'
import {
  ConnectionController,
  ConnectorController,
  type Connector,
  ModalController,
  RouterController,
  ChainController,
  type WcWallet,
  AssetUtil,
  AccountController,
  EventsController,
  ConstantsUtil as CoreConstantsUtil,
  StorageUtil,
  CoreHelperUtil
} from '@reown/appkit-core'
import { ifDefined } from 'lit/directives/if-defined.js'
import { SocialProviderEnum, type SocialProvider } from '@reown/appkit-utils'
import { ConstantsUtil } from '../../utils/ConstantsUtil.js'
import type { WalletButtonType } from '../../utils/TypeUtil.js'
import { ApiController } from '../../controllers/ApiController.js'

@customElement('w3m-wallet-button')
export class W3mWalletButton extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property() wallet: WalletButtonType = 'metamask'

  private popupWindow?: Window | null

  @state() private socialWindow = AccountController.state.socialWindow

  @state() private socialProvider = AccountController.state.socialProvider

  @state() private connectors = ConnectorController.state.connectors

  @state() private caipAddress = ChainController.state.activeCaipAddress

  @state() private connectingSocial = false

  @state() private walletButtons: WcWallet[] = []

  @state() private loading = false

  @state() private error = false

  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        ConnectorController.subscribeKey('connectors', val => (this.connectors = val)),
        ChainController.subscribeKey('activeCaipAddress', val => {
          if (val) {
            this.loading = false
          }

          this.caipAddress = val
        }),
        ApiController.subscribeKey('walletButtons', val => (this.walletButtons = val)),
        ModalController.subscribeKey('open', val => {
          if (!val) {
            this.loading = false
            RouterController.push('Connect')
          }
        }),
        ...[
          AccountController.subscribe(val => {
            if (val.socialProvider) {
              this.socialProvider = val.socialProvider
            }
            if (val.socialWindow) {
              this.socialWindow = val.socialWindow
            }
            if (val.address) {
              if (ModalController.state.open) {
                ModalController.close()
              }
            }
          })
        ]
      ]
    )
  }

  // -- Lifecycle ----------------------------------------- //
  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  public override firstUpdated() {
    ApiController.fetchWalletButtons()
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const supportedSocials = CoreConstantsUtil.DEFAULT_FEATURES.socials as SocialProvider[]

    if (supportedSocials.includes(this.wallet as SocialProvider)) {
      return this.socialTemplate()
    }

    const walletButton = this.getWalletButton()

    const connector = walletButton
      ? ConnectorController.getConnector(walletButton.id, walletButton.rdns)
      : undefined

    if (!connector) {
      return this.walletButtonTemplate()
    }

    return this.externalTemplate(connector)
  }

  // -- Private ------------------------------------------- //

  private walletButtonTemplate() {
    const walletButtonsReady = this.walletButtons.length > 0

    const walletConnect = this.wallet === 'walletConnect'

    const loading = this.loading || !walletButtonsReady

    const walletButton = this.getWalletButton()

    const walletImage = AssetUtil.getWalletImageById(walletButton?.image_id)
    const walletName = this.wallet === 'walletConnect' ? 'WalletConnect' : walletButton?.name

    return html`
      <wui-wallet-button
        ?walletConnect=${this.wallet === 'walletConnect'}
        name=${!walletButtonsReady && !walletName ? 'Loading...' : ifDefined(walletName)}
        imageSrc=${ifDefined(walletImage)}
        @click=${() => this.onOpenQrModal()}
        ?disabled=${Boolean(this.caipAddress)}
        ?loading=${walletConnect ? this.loading : loading}
      ></wui-wallet-button>
    `
  }

  // Used for EIP6963 / injected connectors
  private externalTemplate(connector: Connector) {
    const { image_id } = this.getWalletButton() ?? {}

    const walletImage = AssetUtil.getWalletImageById(image_id)

    const connectorImage = AssetUtil.getConnectorImage(connector)

    return html`
      <wui-wallet-button
        imageSrc=${ifDefined(connectorImage ?? walletImage)}
        name=${ifDefined(connector.name)}
        @click=${() => this.onConnector(connector)}
        ?disabled=${Boolean(this.caipAddress)}
        ?loading=${this.loading}
        ?error=${this.error}
      ></wui-wallet-button>
    `
  }

  private socialTemplate() {
    return html`<wui-wallet-button
      social
      name=${this.wallet}
      @click=${() => this.onSocialClick(this.wallet as SocialProvider)}
      ?disabled=${Boolean(this.caipAddress)}
      ?loading=${this.loading}
      ?error=${this.error}
    ></wui-wallet-button>`
  }

  private onOpenQrModal() {
    this.loading = true

    if (this.wallet === 'walletConnect') {
      const connector = this.connectors.find(c => c.id === 'walletConnect')
      ChainController.setActiveConnector(connector)
    }

    ModalController.open({ view: 'ConnectingWalletConnect' })
    RouterController.push('ConnectingWalletConnect', { wallet: this.getWalletButton() })
  }

  private async onConnector(connector: Connector) {
    try {
      this.error = false
      this.loading = true
      await ConnectionController.connectExternal(connector, connector.chain)
    } catch {
      this.error = true
    } finally {
      this.loading = false
    }
  }

  private getWalletButton() {
    if (this.wallet in ConstantsUtil.WalletButtonsIds) {
      return this.walletButtons.find(
        walletButton =>
          walletButton.id ===
          ConstantsUtil.WalletButtonsIds[this.wallet as keyof typeof ConstantsUtil.WalletButtonsIds]
      )
    }

    return undefined
  }

  private handleSocialConnection = async (event: MessageEvent) => {
    if (event.data?.resultUri) {
      if (event.origin === ConstantsUtil.SECURE_SITE_ORIGIN) {
        window.removeEventListener('message', this.handleSocialConnection, false)
        try {
          const authConnector = ConnectorController.getAuthConnector()

          if (authConnector && !this.connectingSocial) {
            if (this.socialWindow) {
              this.socialWindow.close()
              AccountController.setSocialWindow(undefined, ChainController.state.activeChain)
            }
            this.connectingSocial = true
            const uri = event.data.resultUri as string

            if (this.socialProvider) {
              EventsController.sendEvent({
                type: 'track',
                event: 'SOCIAL_LOGIN_REQUEST_USER_DATA',
                properties: { provider: this.socialProvider }
              })
            }
            await authConnector.provider.connectSocial(uri)

            if (this.socialProvider) {
              StorageUtil.setConnectedSocialProvider(this.socialProvider)
              await ConnectionController.connectExternal(authConnector, authConnector.chain)
              this.loading = false
              EventsController.sendEvent({
                type: 'track',
                event: 'SOCIAL_LOGIN_SUCCESS',
                properties: { provider: this.socialProvider }
              })
            }
          }
        } catch {
          this.error = true
          this.loading = false
          if (this.socialProvider) {
            EventsController.sendEvent({
              type: 'track',
              event: 'SOCIAL_LOGIN_ERROR',
              properties: { provider: this.socialProvider }
            })
          }
        }
      } else if (this.socialProvider) {
        EventsController.sendEvent({
          type: 'track',
          event: 'SOCIAL_LOGIN_ERROR',
          properties: { provider: this.socialProvider }
        })
      }
    }
  }

  private connectSocial() {
    const interval = setInterval(() => {
      if (this.socialWindow?.closed && !this.connectingSocial) {
        this.loading = false
        this.error = false
        clearInterval(interval)
      }
    }, 1000)
    window.addEventListener('message', this.handleSocialConnection, false)
  }

  async onSocialClick(socialProvider?: SocialProvider) {
    this.error = false
    this.loading = true

    if (socialProvider) {
      AccountController.setSocialProvider(socialProvider, ChainController.state.activeChain)

      EventsController.sendEvent({
        type: 'track',
        event: 'SOCIAL_LOGIN_STARTED',
        properties: { provider: socialProvider }
      })
    }
    if (socialProvider === SocialProviderEnum.Farcaster) {
      ModalController.open({ view: 'ConnectingFarcaster' })

      const authConnector = ConnectorController.getAuthConnector()

      if (authConnector) {
        if (!AccountController.state.farcasterUrl) {
          try {
            const { url } = await authConnector.provider.getFarcasterUri()

            AccountController.setFarcasterUrl(url, ChainController.state.activeChain)
          } catch {
            this.error = true
            this.loading = false
          }
        }
      }
    } else {
      const authConnector = ConnectorController.getAuthConnector()
      this.popupWindow = CoreHelperUtil.returnOpenHref(
        '',
        'popupWindow',
        'width=600,height=800,scrollbars=yes'
      )

      try {
        if (authConnector && socialProvider) {
          const { uri } = await authConnector.provider.getSocialRedirectUri({
            provider: socialProvider
          })

          if (this.popupWindow && uri) {
            AccountController.setSocialWindow(this.popupWindow, ChainController.state.activeChain)
            this.popupWindow.location.href = uri
            this.connectSocial()
          } else {
            this.popupWindow?.close()
            throw new Error('Something went wrong')
          }
        }
      } catch {
        this.error = true
        this.loading = false
        this.popupWindow?.close()
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-wallet-button': W3mWalletButton
  }
}
