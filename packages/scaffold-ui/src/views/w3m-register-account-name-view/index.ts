import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { type Ref, createRef, ref } from 'lit/directives/ref.js'

import { ConstantsUtil } from '@reown/appkit-common'
import {
  AccountController,
  ChainController,
  CoreHelperUtil,
  EnsController,
  EventsController,
  type ReownName,
  SnackController,
  getPreferredAccountType
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-ens-input'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon'
import '@reown/appkit-ui/wui-icon-link'
import '@reown/appkit-ui/wui-loading-spinner'
import '@reown/appkit-ui/wui-tag'
import '@reown/appkit-ui/wui-text'
import { W3mFrameRpcConstants } from '@reown/appkit-wallet/utils'

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

  @state() private profileName = AccountController.state.profileName

  public constructor() {
    super()
    this.usubscribe.push(
      ...[
        EnsController.subscribe(val => {
          this.suggestions = val.suggestions
          this.loading = val.loading
        }),
        AccountController.subscribeKey('profileName', val => {
          this.profileName = val
          if (val) {
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
        gap="m"
        .padding=${['0', 's', 'm', 's'] as const}
      >
        <form ${ref(this.formRef)} @submit=${this.onSubmitName.bind(this)}>
          <wui-ens-input
            @inputChange=${this.onNameInputChange.bind(this)}
            .errorMessage=${this.error}
            .value=${this.name}
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
        color="fg-200"
      ></wui-loading-spinner>`
    }

    const reownName = `${this.name}${ConstantsUtil.WC_NAME_SUFFIX}` as ReownName

    return html`
      <wui-icon-link
        .disabled=${isRegistered}
        class="input-submit-button"
        size="sm"
        icon="chevronRight"
        iconColor=${isRegistered ? 'fg-200' : 'accent-100'}
        @click=${() => this.onSubmitName(reownName)}
      >
      </wui-icon-link>
    `
  }

  private onDebouncedNameInputChange = CoreHelperUtil.debounce((value: string) => {
    if (EnsController.validateName(value)) {
      this.error = ''
      this.name = value
      EnsController.getSuggestions(value)
    } else if (value.length < 4) {
      this.error = 'Name must be at least 4 characters long'
    } else {
      this.error = 'Can only contain letters, numbers and - characters'
    }
  })

  private onNameInputChange(event: CustomEvent<string>) {
    this.onDebouncedNameInputChange(event.detail)
  }

  private nameSuggestionTagTemplate(suggestion: { name: string; registered: boolean }) {
    if (this.loading) {
      return html`<wui-loading-spinner color="fg-200"></wui-loading-spinner>`
    }

    return suggestion.registered
      ? html`<wui-tag variant="shade" size="lg">Registered</wui-tag>`
      : html`<wui-tag variant="success" size="lg">Available</wui-tag>`
  }

  private templateSuggestions() {
    if (!this.name || this.name.length < 4 || this.error) {
      return null
    }

    return html`<wui-flex flexDirection="column" gap="xxs" alignItems="center">
      ${this.suggestions.map(
        suggestion =>
          html`<button
            .disabled=${suggestion.registered || this.loading}
            data-testid="account-name-suggestion"
            class="suggestion"
            @click=${() => this.onSubmitName(suggestion.name as ReownName)}
          >
            <wui-text color="fg-100" variant="paragraph-400" class="suggested-name">
              ${suggestion.name}</wui-text
            >${this.nameSuggestionTagTemplate(suggestion)}
          </button>`
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
          error: (error as Error)?.message || 'Unknown error'
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
