import { css } from 'lit'

export default css`
  :host {
    display: block;
    border-radius: clamp(0px, var(--apkt-borderRadius-8), 44px);
    box-shadow: 0 0 0 1px var(--apkt-tokens-theme-foregroundPrimary);
    background-color: var(--apkt-tokens-theme-backgroundPrimary);
    overflow: hidden;
  }
`
