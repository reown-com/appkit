import { css } from 'lit'

export default css`
  :host {
    display: block;
  }

  wui-flex {
    position: relative;
  }

  wui-icon-box {
    width: 32px;
    height: 32px;
    border-radius: var(--apkt-borderRadius-10) !important;
    border: 4px solid var(--apkt-tokens-theme-backgroundPrimary);
    background: var(--apkt-tokens-theme-foregroundPrimary);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 3;
  }

  wui-button {
    --local-border-radius: var(--apkt-borderRadius-4) !important;
  }

  .inputContainer {
    height: fit-content;
  }
`
