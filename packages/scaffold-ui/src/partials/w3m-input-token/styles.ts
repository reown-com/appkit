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
    transition: all var(--apkt-ease-out-power-1) var(--apkt-duration-lg);
  }

  :host(:hover) {
    background-color: var(--apkt-tokens-theme-foregroundSecondary);
  }

  wui-flex {
    width: 100%;
    height: fit-content;
  }

  wui-button {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }

  wui-input-amount {
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

  .totalValue {
    width: 100%;
  }
`
