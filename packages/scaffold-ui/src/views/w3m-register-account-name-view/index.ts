import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { type Ref, createRef, ref } from 'lit/directives/ref.js'

import { ConstantsUtil } from '@reown/appkit-common'
import {
  ChainController,
  CoreHelperUtil,
  EnsController,
  EventsController,
  type ReownName,
  SnackController,
  getPreferredAccountType
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-account-name-suggestion-item'
import '@reown/appkit-ui/wui-ens-input'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon'
import '@reown/appkit-ui/wui-icon-link'
import '@reown/appkit-ui/wui-loading-spinner'
import '@reown/appkit-ui/wui-text'
import { W3mFrameRpcConstants } from '@reown/appkit-wallet/utils'

import { HelpersUtil } from '../../utils/HelpersUtil.js'
import styles from './styles.js'

@customElement('w3m-register-account-name-view')
export class W3mRegisterAccountNameView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private formRef: Ref<HTMLFormElement> = createRef()
  private usubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property() public errorMessage?: string

  @state() private name = ''

  @state() private error = ''

  @state() private loading = EnsController.state.loading

  @state() private suggestions = EnsController.state.suggestions

  @state() private profileName = ChainController.getAccountData()?.profileName

  public constructor() {
    super()
    this.usubscribe.push(
      ...[
        EnsController.subscribe(val => {
          this.suggestions = val.suggestions
          this.loading = val.loading
        }),
        ChainController.subscribeChainProp('accountState', val => {
          this.profileName = val?.profileName
          if (val?.profileName) {
            this.error = 'You already own a name'
          }
        })
      ]
    )
  }

  // -- Lifecycle ----------------------------------------- //
  public override firstUpdated() {
    this.formRef.value?.addEventListener('keydown', this.onEnterKey.bind(this))
  }

  public override disconnectedCallback() {
    super.disconnectedCallback()
    this.usubscribe.forEach(unsub => unsub())
    this.formRef.value?.removeEventListener('keydown', this.onEnterKey.bind(this))
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        gap="4"
        .padding=${['1', '3', '4', '3'] as const}
      >
        <form ${ref(this.formRef)} @submit=${this.onSubmitName.bind(this)}>
          <wui-ens-input
            @inputChange=${this.onNameInputChange.bind(this)}
            .errorMessage=${this.error}
            .value=${this.name}
            .onKeyDown=${this.onKeyDown.bind(this)}
          >
          </wui-ens-input>
          ${this.submitButtonTemplate()}
          <input type="submit" hidden />
        </form>
        ${this.templateSuggestions()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private submitButtonTemplate() {
    const isRegistered = this.suggestions.find(
      s => s.name?.split('.')?.[0] === this.name && s.registered
    )

    if (this.loading) {
      return html`<wui-loading-spinner
        class="input-loading-spinner"
        color="secondary"
      ></wui-loading-spinner>`
    }

    const reownName = `${this.name}${ConstantsUtil.WC_NAME_SUFFIX}` as ReownName

    return html`
      <wui-icon-link
        ?disabled=${Boolean(isRegistered)}
        class="input-submit-button"
        size="sm"
        icon="chevronRight"
        iconColor=${isRegistered ? 'default' : 'accent-primary'}
        @click=${() => this.onSubmitName(reownName)}
      >
      </wui-icon-link>
    `
  }

  private onDebouncedNameInputChange = CoreHelperUtil.debounce((value: string) => {
    if (value.length < 4) {
      this.error = 'Name must be at least 4 characters long'
      // eslint-disable-next-line no-negated-condition
    } else if (!HelpersUtil.isValidReownName(value)) {
      this.error = 'The value is not a valid username'
    } else {
      this.error = ''
      EnsController.getSuggestions(value)
    }
  })

  private onNameInputChange(event: CustomEvent<string>) {
    const value = HelpersUtil.validateReownName(event.detail || '')
    this.name = value
    this.onDebouncedNameInputChange(value)
  }

  private onKeyDown(event: KeyboardEvent) {
    // eslint-disable-next-line no-negated-condition
    if (event.key.length === 1 && !HelpersUtil.isValidReownName(event.key)) {
      event.preventDefault()
    }
  }

  private templateSuggestions() {
    if (!this.name || this.name.length < 4 || this.error) {
      return null
    }

    return html`<wui-flex flexDirection="column" gap="1" alignItems="center">
      ${this.suggestions.map(
        suggestion =>
          html`<wui-account-name-suggestion-item
            name=${suggestion.name}
            ?registered=${suggestion.registered}
            ?loading=${this.loading}
            ?disabled=${suggestion.registered || this.loading}
            data-testid="account-name-suggestion"
            @click=${() => this.onSubmitName(suggestion.name as ReownName)}
          ></wui-account-name-suggestion-item>`
      )}
    </wui-flex>`
  }

  private isAllowedToSubmit(name: string) {
    const pureName = name.split('.')?.[0]
    const isRegistered = this.suggestions.find(
      s => s.name?.split('.')?.[0] === pureName && s.registered
    )

    return (
      !this.loading &&
      !this.error &&
      !this.profileName &&
      pureName &&
      EnsController.validateName(pureName) &&
      !isRegistered
    )
  }

  private async onSubmitName(name: ReownName) {
    try {
      if (!this.isAllowedToSubmit(name)) {
        return
      }
      EventsController.sendEvent({
        type: 'track',
        event: 'REGISTER_NAME_INITIATED',
        properties: {
          isSmartAccount:
            getPreferredAccountType(ChainController.state.activeChain) ===
            W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT,
          ensName: name
        }
      })
      await EnsController.registerName(name)
      EventsController.sendEvent({
        type: 'track',
        event: 'REGISTER_NAME_SUCCESS',
        properties: {
          isSmartAccount:
            getPreferredAccountType(ChainController.state.activeChain) ===
            W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT,
          ensName: name
        }
      })
    } catch (error) {
      SnackController.showError((error as Error).message)
      EventsController.sendEvent({
        type: 'track',
        event: 'REGISTER_NAME_ERROR',
        properties: {
          isSmartAccount:
            getPreferredAccountType(ChainController.state.activeChain) ===
            W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT,
          ensName: name,
          error: CoreHelperUtil.parseError(error)
        }
      })
    }
  }

  private onEnterKey(event: KeyboardEvent) {
    if (event.key === 'Enter' && this.name && this.isAllowedToSubmit(this.name)) {
      const reownName = `${this.name}${ConstantsUtil.WC_NAME_SUFFIX}` as ReownName
      this.onSubmitName(reownName)
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-register-account-name-view': W3mRegisterAccountNameView
  }
}
