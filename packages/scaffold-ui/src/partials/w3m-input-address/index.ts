import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { createRef, ref } from 'lit/directives/ref.js'
import type { Ref } from 'lit/directives/ref.js'

import { CoreHelperUtil } from '@reown/appkit-controllers'
import { sendActor } from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon'
import '@reown/appkit-ui/wui-text'

import styles from './styles.js'

@customElement('w3m-input-address')
export class W3mInputAddress extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  public inputElementRef: Ref<HTMLInputElement> = createRef()

  public instructionElementRef: Ref<HTMLElement> = createRef()

  // -- State & Properties -------------------------------- //
  @state() public value?: string
  @state() public displayName?: string
  @state() public avatar?: string
  @state() private loading = false
  @state() private hasError = false
  @state() private errorMessage?: string
  @state() private instructionHidden = false
  @state() private pasting = false

  private unsubscribe: (() => void)[] = []

  public constructor() {
    super()

    // Initialize from current actor state
    const snapshot = sendActor.getSnapshot()
    this.updateAddressState(snapshot)

    // Subscribe to actor state changes
    this.unsubscribe.push(
      sendActor.subscribe(actorSnapshot => {
        this.updateAddressState(actorSnapshot)
        this.requestUpdate()
      }).unsubscribe
    )
  }

  public override disconnectedCallback() {
    super.disconnectedCallback()
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Private ------------------------------------------- //
  private updateAddressState(
    snapshot: typeof sendActor extends { getSnapshot(): infer T } ? T : never
  ) {
    const address = snapshot.context.receiverAddress || ''
    const name = snapshot.context.receiverProfileName
    const avatar = snapshot.context.receiverProfileImageUrl
    const loading = snapshot.matches('resolvingENS')

    const hasError = false
    const error = undefined

    this.value = name || address
    this.displayName = name
    this.avatar = avatar
    this.loading = loading
    this.hasError = hasError
    this.errorMessage = error

    const shouldShowInstruction = this.instructionHidden
    this.instructionHidden = Boolean(this.value)

    if (shouldShowInstruction && !this.instructionHidden) {
      setTimeout(() => this.focusInstruction(), 0)
    }
  }

  protected override firstUpdated() {
    this.checkHidden()

    if (!this.instructionHidden) {
      setTimeout(() => this.focusInstruction(), 0)
    }
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html` <wui-flex
      @click=${this.onBoxClick.bind(this)}
      flexDirection="column"
      justifyContent="center"
      gap="01"
      .padding=${['8', '4', '5', '4'] as const}
    >
      <wui-text
        ${ref(this.instructionElementRef)}
        class="instruction"
        color="secondary"
        variant="md-medium"
      >
        Type or
        <wui-button
          class="paste"
          size="md"
          variant="neutral-secondary"
          iconLeft="copy"
          @click=${this.onPasteClick.bind(this)}
        >
          <wui-icon size="sm" color="inherit" slot="iconLeft" name="copy"></wui-icon>
          Paste
        </wui-button>
        address
      </wui-text>
      <textarea
        spellcheck="false"
        ?disabled=${!this.instructionHidden || this.loading}
        ${ref(this.inputElementRef)}
        @input=${this.onInputChange.bind(this)}
        @blur=${this.onBlur.bind(this)}
        .value=${this.value ?? ''}
        autocomplete="off"
        class=${this.hasError ? 'error' : ''}
      >
${this.value ?? ''}</textarea
      >
      ${this.hasError
        ? html` <wui-text variant="small-400" color="error-100"> ${this.errorMessage} </wui-text> `
        : null}
    </wui-flex>`
  }

  // -- Private ------------------------------------------- //
  private async focusInput() {
    if (this.instructionElementRef.value) {
      this.instructionHidden = true
      await this.toggleInstructionFocus(false)
      this.instructionElementRef.value.style.pointerEvents = 'none'
      this.inputElementRef.value?.focus()
      if (this.inputElementRef.value) {
        // eslint-disable-next-line no-multi-assign
        this.inputElementRef.value.selectionStart = this.inputElementRef.value.selectionEnd =
          this.inputElementRef.value.value.length
      }
    }
  }

  private async focusInstruction() {
    if (this.instructionElementRef.value) {
      this.instructionHidden = false
      await this.toggleInstructionFocus(true)
      this.instructionElementRef.value.style.pointerEvents = 'auto'
      this.inputElementRef.value?.blur()
    }
  }

  private async toggleInstructionFocus(focus: boolean) {
    if (this.instructionElementRef.value) {
      await this.instructionElementRef.value.animate(
        [{ opacity: focus ? 0 : 1 }, { opacity: focus ? 1 : 0 }],
        {
          duration: 100,
          easing: 'ease',
          fill: 'forwards'
        }
      ).finished
    }
  }

  private onBoxClick() {
    if (!this.value && !this.instructionHidden) {
      this.focusInput()
    }
  }

  private onBlur() {
    if (!this.value && this.instructionHidden && !this.pasting) {
      this.focusInstruction()
    }
  }

  private checkHidden() {
    if (this.instructionHidden) {
      this.focusInput()
    }
  }

  private async onPasteClick() {
    this.pasting = true

    try {
      const text = await navigator.clipboard.readText()
      sendActor.send({ type: 'SET_ADDRESS', address: text })
      this.focusInput()
    } catch {
      // Silently handle clipboard errors
    }
  }

  private onInputChange(e: InputEvent) {
    const element = e.target as HTMLInputElement

    this.pasting = false
    this.value = (e.target as HTMLInputElement)?.value

    if (element.value && !this.instructionHidden) {
      this.focusInput()
    }

    this.onDebouncedSearch(element.value)
  }

  private onDebouncedSearch = CoreHelperUtil.debounce((value: string) => {
    if (!value.length) {
      sendActor.send({ type: 'CLEAR_ADDRESS' })

      return
    }

    // Send the address to XState - it will handle validation and ENS resolution
    sendActor.send({ type: 'SET_ADDRESS', address: value })
  })
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-input-address': W3mInputAddress
  }
}
