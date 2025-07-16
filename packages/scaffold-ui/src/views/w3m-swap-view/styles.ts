import { css } from 'lit'

export default css`
  :host > wui-flex:first-child {
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
  }

  :host > wui-flex:first-child::-webkit-scrollbar {
    display: none;
  }

  wui-loading-hexagon {
    position: absolute;
  }

  .action-button {
    width: 100%;
    border-radius: var(--wui-border-radius-xs);
  }

  .action-button:disabled {
    border-color: 1px solid var(--wui-color-gray-glass-005);
  }

  .swap-inputs-container {
    position: relative;
  }

  wui-icon-box {
    width: 32px;
    height: 32px;
    border-radius: var(--wui-border-radius-xs) !important;
    border: 4px solid var(--apkt-tokens-theme-backgroundPrimary);
    background: var(--apkt-tokens-theme-foregroundPrimary);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 3;
  }

  .replace-tokens-button-container {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    gap: var(--apkt-spacing-2);
    border-radius: var(--wui-border-radius-xs);
    background-color: var(--wui-color-modal-bg-base);
    padding: var(--apkt-spacing-2);
  }

  .details-container > wui-flex {
    background: var(--apkt-tokens-theme-foregroundPrimary);
    border-radius: var(--wui-border-radius-xxs);
    width: 100%;
  }

  .details-container > wui-flex > button {
    border: none;
    background: none;
    padding: var(--apkt-spacing-3);
    border-radius: var(--wui-border-radius-xxs);
    transition: background 0.2s linear;
  }

  .details-container > wui-flex > button:hover {
    background: var(--apkt-tokens-theme-foregroundPrimary);
  }

  .details-content-container {
    padding: var(--apkt-spacing-2);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .details-content-container > wui-flex {
    width: 100%;
  }

  .details-row {
    width: 100%;
    padding: var(--apkt-spacing-3) var(--apkt-spacing-5);
    border-radius: var(--wui-border-radius-xxs);
    background: var(--apkt-tokens-theme-foregroundPrimary);
  }
`
