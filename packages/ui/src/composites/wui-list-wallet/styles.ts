import { css } from 'lit'

export default css`
  button {
    column-gap: var(--wui-spacing-s);
    padding: 7px var(--wui-spacing-l) 7px var(--wui-spacing-xs);
    width: 100%;
    background-color: var(--wui-overlay-002);
    border-radius: var(--wui-border-radius-xs);
  }

  button > wui-text:nth-child(2) {
    display: flex;
    flex: 1;
  }

  wui-icon {
    color: var(--wui-color-fg-200) !important;
  }

  button:disabled > wui-tag {
    background-color: var(--wui-overlay-010);
    color: var(--wui-color-fg-300);
  }
`
