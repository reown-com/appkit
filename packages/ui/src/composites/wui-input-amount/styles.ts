import { css } from 'lit'

export default css`
  :host {
    position: relative;
    display: inline-block;
  }

  input {
    background: transparent;
    width: 100%;
    height: auto;
    color: var(--apkt-tokens-theme-textPrimary);
    font-feature-settings: 'case' on;
    font-size: 32px;
    caret-color: var(--apkt-colors-accent100);
    line-height: 130%;
    letter-spacing: -1.28px;
    box-sizing: border-box;
    -webkit-appearance: none;
    -moz-appearance: textfield;
    padding: 0px;
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input::placeholder {
    color: var(--apkt-tokens-theme-foregroundTertiary);
  }
`
