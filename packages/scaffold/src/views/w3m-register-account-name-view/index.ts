import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import styles from './styles.js'
import { createRef, ref, type Ref } from 'lit/directives/ref.js'
import { SnackController } from '@web3modal/core'

@customElement('w3m-register-account-name-view')
export class W3mRegisterAccountNameView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private formRef: Ref<HTMLFormElement> = createRef()

  // -- State & Properties -------------------------------- //
  @property() public errorMessage?: string

  @state() private name = ''

  @state() private loading = false

  @state() private error = ''

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
    const showSubmit = !this.loading && this.name.length > 3

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

  private onNameInputChange(event: CustomEvent<string>) {
    this.name = event.detail
    this.error = ''
  }

  private templateSuggestions() {
    return html`<wui-flex flexDirection="column" gap="xxs" alignItems="center">
      <wui-flex
        .padding=${['m', 'm', 'm', 'm'] as const}
        justifyContent="space-between"
        class="suggestion"
      >
        <wui-text color="fg-100" variant="paragraph-400">diane</wui-text
        ><wui-tag variant="success" size="lg">Available</wui-tag>
      </wui-flex>
    </wui-flex>`
  }

  private onSubmitName(event: Event) {
    try {
      if (this.loading) {
        return
      }
      this.loading = true
      event.preventDefault()
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
