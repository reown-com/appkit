import type { Settings } from '@web3modal/core'
import { ConfigCtrl } from '@web3modal/core'
import { LitElement } from 'lit'
import { state } from 'lit/decorators.js'

export default class ThemedElement extends LitElement {
  // -- state & properties ------------------------------------------- //
  @state() protected theme: Settings['theme'] = 'light'
  @state() protected accentColor: Settings['accentColor'] = 'default'

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()

    this.configUnsub = ConfigCtrl.subscribe(configState => {
      this.theme = configState.theme ?? 'dark'
      this.accentColor = configState.accentColor ?? 'default'
    })
  }

  public disconnectedCallback() {
    this.configUnsub?.()
  }

  // -- private ------------------------------------------------------ //
  private readonly configUnsub?: () => void = undefined
}
