import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { createRef, ref } from 'lit/directives/ref.js'
import type { Ref } from 'lit/directives/ref.js'

import {
  ChainController,
  ConnectionController,
  CoreHelperUtil,
  SendController
} from '@reown/appkit-controllers'
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
  @property() public value?: string

  @state() private instructionHidden = Boolean(this.value)

  @state() private pasting = false

  protected override firstUpdated() {
    if (this.value) {
      this.instructionHidden = true
    }
    this.checkHidden()
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html` <wui-flex
      @click=${this.onBoxClick.bind(this)}
      flexDirection="column"
      justifyContent="center"
      gap="4xs"
      .padding=${['2xl', 'l', 'xl', 'l'] as const}
    >
      <wui-text
        ${ref(this.instructionElementRef)}
        class="instruction"
        color="fg-300"
        variant="medium-400"
      >
        Type or
        <wui-button
          class="paste"
          size="md"
          variant="neutral"
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
        ?disabled=${!this.instructionHidden}
        ${ref(this.inputElementRef)}
        @input=${this.onInputChange.bind(this)}
        @blur=${this.onBlur.bind(this)}
        .value=${this.value ?? ''}
        autocomplete="off"
      >
${this.value ?? ''}</textarea
      >
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

    const text = await navigator.clipboard.readText()
    SendController.setReceiverAddress(text)
    this.focusInput()
  }

  private onInputChange(e: InputEvent) {
    const element = e.target as HTMLInputElement

    this.pasting = false
    this.value = (e.target as HTMLInputElement)?.value

    if (element.value && !this.instructionHidden) {
      this.focusInput()
    }
    SendController.setLoading(true)
    this.onDebouncedSearch(element.value)
  }

  private onDebouncedSearch = CoreHelperUtil.debounce(async (value: string) => {
    if (!value.length) {
      this.setReceiverAddress('')

      return
    }

    const activeChain = ChainController.state.activeChain
    const isValidAddress = CoreHelperUtil.isAddress(value, activeChain)

    if (isValidAddress) {
      this.setReceiverAddress(value)

      return
    }

    try {
      const resolvedAddress = await ConnectionController.getEnsAddress(value)

      if (resolvedAddress) {
        SendController.setReceiverProfileName(value)
        SendController.setReceiverAddress(resolvedAddress)
        const avatar = await ConnectionController.getEnsAvatar(value)
        SendController.setReceiverProfileImageUrl(avatar || undefined)
      }
    } catch (error) {
      this.setReceiverAddress(value)
    } finally {
      SendController.setLoading(false)
    }
  })

  private setReceiverAddress(address: string) {
    SendController.setReceiverAddress(address)
    SendController.setReceiverProfileName(undefined)
    SendController.setReceiverProfileImageUrl(undefined)
    SendController.setLoading(false)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-input-address': W3mInputAddress
  }
}
