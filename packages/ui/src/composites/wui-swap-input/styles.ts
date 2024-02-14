import { css } from 'lit'

export default css`
  :host > wui-flex {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    background: var(--wui-gray-glass-002);
    border: 1px solid var(--wui-gray-glass-002);
    border-radius: 24px;
    padding: var(--wui-spacing-s);
    padding-left: var(--wui-spacing-m);
    width: 100%;
    box-sizing: border-box;
    position: relative;
    transition: background 0.2s linear;
    gap: var(--wui-spacing-l);
  }

  :host > wui-flex.focus {
    background: var(--wui-gray-glass-005);
  }

  :host > wui-flex .swap-input {
    -webkit-mask-image: linear-gradient(
      270deg,
      transparent 0px,
      transparent 8px,
      black 24px,
      black 25px,
      black 32px,
      black 100%
    );
    mask-image: linear-gradient(
      270deg,
      transparent 0px,
      transparent 8px,
      black 24px,
      black 25px,
      black 32px,
      black 100%
    );
  }

  :host > wui-flex .swap-input input {
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
    color: var(--wui-color-fg-100);
  }

  :host > wui-flex .swap-input input::placeholder {
    color: var(--wui-color-fg-275);
  }

  :host > wui-flex .swap-input input:focus-visible {
    outline: none;
  }

  :host > wui-flex .swap-input input::-webkit-outer-spin-button,
  :host > wui-flex .swap-input input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .currency-select-button-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .currency-select-button-container button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--wui-spacing-xxs);
    padding: var(--wui-spacing-xs);
    padding-right: var(--wui-spacing-1xs);
    height: 40px;
    border: none;
    border-radius: 80px;
    background: var(--wui-gray-glass-002);
    box-shadow: inset 0 0 0 1px var(--wui-gray-glass-002);
    cursor: pointer;
    transition: background 0.2s linear;
  }

  .currency-select-button-container button:hover {
    background: var(--wui-gray-glass-005);
  }

  .currency-select-button wui-image {
    width: 24px;
    height: 24px;
    border-radius: var(--wui-border-radius-s);
    box-shadow: inset 0 0 0 1px var(--wui-gray-glass-010);
  }
`
