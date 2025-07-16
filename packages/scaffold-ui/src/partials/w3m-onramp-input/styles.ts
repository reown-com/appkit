import { css } from 'lit'

export default css`
  :host {
    width: 100%;
  }

  wui-loading-spinner {
    position: absolute;
    top: 50%;
    right: 20px;
    transform: translateY(-50%);
  }

  .currency-container {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: var(--apkt-spacing-2);
    height: 40px;
    padding: var(--apkt-spacing-2) var(--apkt-spacing-2) var(--apkt-spacing-2) var(--apkt-spacing-2);
    min-width: 95px;
    border-radius: var(--FULL, 1000px);
    border: 1px solid var(--apkt-tokens-theme-foregroundPrimary);
    background: var(--apkt-tokens-theme-foregroundPrimary);
    cursor: pointer;
  }

  .currency-container > wui-image {
    height: 24px;
    width: 24px;
    border-radius: 50%;
  }
`
