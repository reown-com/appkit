import { css } from 'lit'

export default css`
  :host > wui-flex:first-child {
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
  }

  wui-loading-hexagon {
    position: absolute;
  }

  .action-button {
    width: 100%;
    border-radius: var(--wui-border-radius-xs);
  }

  .action-button button {
    width: 100%;
    height: 48px;
    border-radius: var(--wui-border-radius-xs);
  }

  .swap-inputs-container {
    position: relative;
  }

  .replace-tokens-button-container {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--wui-color-modal-bg);
    border-radius: calc(var(--wui-border-radius-s) - 2px);
    padding: 5px;
  }

  .replace-tokens-button {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--4XS, 10px);w
    width: 40px;
    height: 40px;
    padding: var(--5XS, 8px);
    border: none;
    border-radius: var(--3XS, 12px);
    background: var(--wui-gray-glass-005);
  }

  .replace-tokens-button:hover {
    background: var(--wui-gray-glass-010);
    cursor: pointer;
  }

  .swap-input {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    background: var(--wui-gray-glass-002);
    border: 1px solid var(--wui-gray-glass-002);
    border-radius: var(--wui-border-radius-s);
    padding: var(--wui-spacing-xl);
    padding-right: var(--wui-spacing-s);
    width: 100%;
    box-sizing: border-box;
    position: relative;
  }

  .swap-input input {
    background: none;
    border: none;
    height: 48px;
    width: 100%;
    font-size: 32px;
    font-style: normal;
    font-weight: 400;
    line-height: 130%;
    letter-spacing: -1.28px;
    outline: none;
  }

  .swap-input input:focus-visible {
    outline: none;
  }

  .swap-input input::-webkit-outer-spin-button,
  .swap-input input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .token-select-button-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .token-select-button-container button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--wui-spacing-xxs);
    padding: var(--wui-spacing-xs);
    height: 40px;
    border: none;
    border-radius: 80px;
    background: var(--wui-gray-glass-002);
    box-shadow: inset 0 0 0 1px var(--wui-gray-glass-002);
    cursor: pointer;
    transition: background 0.2s linear;
  }

  .token-select-button-container button:hover {
    background: var(--wui-gray-glass-005);
  }
`
