import { css } from 'lit'

export default css`
  :host {
    width: 100%;
    height: 100px;
    border-radius: var(--apkt-borderRadius-5);
    border: 1px solid var(--apkt-tokens-theme-foregroundPrimary);
    background-color: var(--apkt-tokens-theme-foregroundPrimary);
    transition: background-color var(--apkt-ease-out-power-1) var(--apkt-duration-lg);
    will-change: background-color;
    position: relative;
  }

  :host(:hover) {
    background-color: var(--apkt-tokens-theme-foregroundSecondary);
  }

  wui-flex {
    width: 100%;
    height: fit-content;
  }

  wui-button {
    display: ruby;
    color: var(--apkt-tokens-theme-textPrimary);
    margin: 0 var(--apkt-spacing-2);
  }

  .instruction {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2;
  }

  .paste {
    display: inline-flex;
  }

  textarea {
    background: transparent;
    width: 100%;
    font-family: var(--apkt-font-family);

    font-style: normal;
    font-weight: var(--apkt-font-weight-light);
    line-height: 130%;
    letter-spacing: var(--apkt-letter-spacing-medium);
    color: var(--apkt-tokens-theme-textPrimary);
    caret-color: var(--apkt-colors-accent100);
    box-sizing: border-box;
    -webkit-appearance: none;
    -moz-appearance: textfield;
    padding: 0px;
    border: none;
    outline: none;
    appearance: none;
    resize: none;
    overflow: hidden;
  }
`
