import { css } from 'lit'

export default css`
  button {
    column-gap: var(--wui-spacing-s);
    padding: 8px 16px 8px 8px;
    width: 100%;
    background-color: var(--wui-overlay-002);
    border-radius: var(--wui-border-radius-xs);
  }

  button > wui-text:nth-child(2) {
    display: flex;
    flex: 1;
  }

  button:disabled > wui-text:nth-child(3) {
    opacity: 0.6;
  }
`
