import { css } from 'lit'

export default css`
  button {
    border-radius: var(--wui-border-radius-xxs);
    color: var(--wui-color-fg-100);
    padding: 9px;
  }

  button > wui-icon {
    pointer-events: none;
  }

  button:disabled > wui-icon {
    color: var(--wui-color-bg-300);
  }

  button:disabled {
    background-color: transparent;
  }
`
