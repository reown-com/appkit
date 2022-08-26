import { ConfigCtrl } from '@web3modal/core'
import { LitElement } from 'lit'
import { state } from 'lit/decorators.js'

type ThemeType = typeof ConfigCtrl['state']['theme']
type AccentColorType = typeof ConfigCtrl['state']['accentColor']

export default class ThemedElement extends LitElement {
  private readonly configUnsub?: () => void = undefined
  @state() protected theme: ThemeType = 'light'
  @state() protected accentColor: AccentColorType = 'default'

  public disconnectedCallback() {
    this.configUnsub?.()
  }

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()

    this.configUnsub = ConfigCtrl.subscribe(configState => {
      this.theme = configState.theme ?? 'dark'
      this.accentColor = configState.accentColor ?? 'default'
    })
  }
}
