import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import styles from './styles.js'
import { createRef, ref, type Ref } from 'lit/directives/ref.js'
import { CoreHelperUtil, SnackController, EnsController } from '@web3modal/core'

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

  @state() private registered = false

  public constructor() {
    super()
    this.usubscribe.push(
      ...[
        EnsController.subscribe(val => {
          this.suggestions = val.suggestions
          this.loading = val.loading
        })
      ]
    )
  }

  // -- Lifecycle ----------------------------------------- //
  public override firstUpdated() {
    this.formRef.value?.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        this.onSubmitName(event)
      }
    })
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
            .disabled=${this.loading}
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
    const showSubmit = !this.loading && this.name.length >= 3

    return showSubmit
      ? html`
          <wui-icon-link
            size="sm"
            icon="chevronRight"
            iconcolor="accent-100"
            @click=${this.onSubmitName.bind(this)}
          >
          </wui-icon-link>
        `
      : null
  }

  private onDebouncedNameInputChange = CoreHelperUtil.debounce((value: string) => {
    if (value.length < 3) {
      this.error = 'Name must be at least 3 characters long'
    } else {
      this.error = ''
      this.name = value
      EnsController.getSuggestions(value)
      EnsController.isNameRegistered(value).then(registered => {
        this.registered = registered
      })
    }
  })

  private onSelectSuggestion(name: string) {
    return () => {
      this.name = name
      this.registered = false
      this.requestUpdate()
    }
  }

  private onNameInputChange(event: CustomEvent<string>) {
    this.onDebouncedNameInputChange(event.detail)
  }

  private nameSuggestionTagTemplate() {
    if (this.loading) {
      return html`<wui-loading-spinner size="lg" color="fg-100"></wui-loading-spinner>`
    }

    return this.registered
      ? html`<wui-tag variant="shade" size="lg">Registered</wui-tag>`
      : html`<wui-tag variant="success" size="lg">Available</wui-tag>`
  }

  private templateSuggestions() {
    if (!this.name) {
      return null
    }

    const suggestions = this.registered ? this.suggestions : []

    return html`<wui-flex flexDirection="column" gap="xxs" alignItems="center">
      <wui-flex
        .padding=${['m', 'm', 'm', 'm'] as const}
        justifyContent="space-between"
        class="suggestion"
      >
        <wui-text color="fg-100" variant="paragraph-400" class="suggested-name"
          >${this.name}</wui-text
        >${this.nameSuggestionTagTemplate()}
      </wui-flex>
      ${suggestions
        .filter(s => s.name !== this.name)
        .map(
          suggestion =>
            html` <wui-flex
              .padding=${['m', 'm', 'm', 'm'] as const}
              justifyContent="space-between"
              class="suggestion"
              @click=${this.onSelectSuggestion(suggestion.name)}
            >
              <wui-text color="fg-100" variant="paragraph-400" class="suggested-name">
                ${suggestion.name}
              </wui-text>
              <wui-tag variant="success" size="lg">Available</wui-tag>
            </wui-flex>`
        )}
    </wui-flex>`
  }

  private async onSubmitName(event: Event) {
    try {
      if (this.loading) {
        return
      }
      event.preventDefault()
      await EnsController.registerName(this.name)
    } catch (error) {
      SnackController.showError('An error occurred, please try again later')
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-register-account-name-view': W3mRegisterAccountNameView
  }
}
