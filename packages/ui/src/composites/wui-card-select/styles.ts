import { css } from 'lit'

export default css`
  button {
    flex-direction: column;
    width: 100%;
    row-gap: var(--wui-spacing-xs);
    padding: 8px 0px;
    background-color: var(--wui-overlay-002);
    border-radius: var(--wui-border-radius-xs);
  }

  button > wui-text {
    color: var(--wui-color-fg-100);
    width: 85%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    justify-content: center;
  }

  button:disabled > wui-text {
    color: var(--wui-color-fg-300);
  }
`
