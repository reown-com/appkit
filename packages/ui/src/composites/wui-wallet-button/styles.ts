import { css } from 'lit'

export default css`
  @keyframes shake {
    0% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(3px);
    }
    50% {
      transform: translateX(-3px);
    }
    75% {
      transform: translateX(3px);
    }
    100% {
      transform: translateX(0);
    }
  }

  :host > button {
    min-width: 40px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    background-color: var(--wui-wallet-button-bg);
    column-gap: var(--wui-spacing-2xs);
    border-radius: var(--wui-border-radius-s);
    border: 1px solid var(--wui-color-gray-glass-002);
    height: var(--wui-spacing-3xl);
    padding: var(--wui-spacing-xs) var(--wui-spacing-m) var(--wui-spacing-xs) var(--wui-spacing-xs);
    box-shadow:
      0px 8px 22px -6px var(--wui-color-gray-glass-010),
      0px 14px 64px -4px var(--wui-color-gray-glass-010);
  }

  :host > button > wui-text {
    text-transform: capitalize;
  }

  :host > button > wui-image {
    height: 24px;
    width: 24px;
    border-radius: var(--wui-border-radius-s);
  }

  :host([data-error='true']) > button {
    animation: shake 250ms cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }

  /* -- Disabled state --------------------------------------------------- */
  :host > button:disabled {
    cursor: default;
  }

  :host > button:disabled > wui-icon {
    filter: grayscale(1);
  }
`
