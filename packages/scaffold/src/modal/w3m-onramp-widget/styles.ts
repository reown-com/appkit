import { css } from 'lit'

export default css`
  :host {
    border-radius: var(--wui-border-radius-l);
  }

  :host > wui-flex {
    border-radius: var(--wui-border-radius-l);
    background: var(--wui-color-bg-150);
    width: fit-content;
  }

  :host > wui-flex > wui-flex {
    border-radius: var(--wui-border-radius-l);
    padding: var(--wui-spacing-2xl);
  }

  .currency-container {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    transition: all var(--wui-ease-in-power-2) var(--wui-duration-md);
    right: 10px;
    padding: var(--wui-spacing-4xs);
  }

  .currency-container > wui-image {
    height: 30px;
    width: 30px;
    border-radius: 50%;
  }

  wui-button {
    width: 100%;
  }
`
