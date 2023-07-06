import { css } from 'lit'

export default css`
  button {
    padding: 2px 6px;
    border-radius: var(--wui-border-radius-3xs);
    background-color: transparent;
    color: var(--wui-color-blue-100);
  }

  button:disabled {
    background-color: transparent;
    color: var(--wui-color-bg-300);
  }
`
