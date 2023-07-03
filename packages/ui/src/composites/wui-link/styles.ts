import { css } from 'lit'

export default css`
  button {
    padding: 2px 6px;
    border-radius: var(--wui-border-radius-3xs);
    background-color: transparent;
  }

  button:disabled > wui-text,
  button:disabled > wui-icon {
    color: var(--wui-color-bg-300);
  }
`
