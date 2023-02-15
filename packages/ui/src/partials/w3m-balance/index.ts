import { OptionsCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { ThemeUtil } from '../../utils/ThemeUtil'
import styles from './styles.css'

@customElement('w3m-balance')
export class W3mBalance extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @state() private symbol?: string = undefined
  @state() private amount?: string = undefined

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.symbol = OptionsCtrl.state.balance?.symbol
    this.amount = OptionsCtrl.state.balance?.amount
    this.unsubscribeAccount = OptionsCtrl.subscribe(({ balance }) => {
      this.symbol = balance?.symbol
      this.amount = balance?.amount
    })
  }

  public disconnectedCallback() {
    this.unsubscribeAccount?.()
  }

  // -- private ------------------------------------------------------ //
  private readonly unsubscribeAccount?: () => void = undefined

  // -- render ------------------------------------------------------- //
  protected render() {
    let formatAmount: number | string = '_._'

    if (this.amount === '0.0') {
      formatAmount = 0
    }

    if (this.amount && this.amount.length > 6) {
      formatAmount = parseFloat(this.amount).toFixed(3)
    }
    else if(this.amount){
      formatAmount = parseFloat(this.amount)
    }

    return html`
      <div>
        <w3m-token-image symbol=${ifDefined(this.symbol)}></w3m-token-image>
        <w3m-text variant="medium-normal" color="primary">${formatAmount} ${this.symbol}</w3m-text>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-balance': W3mBalance
  }
}
