import { css } from 'lit'

export default css`
  :host {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    row-gap: var(--wui-spacing-xs);
    padding: 8px 10px;
    background-color: var(--wui-overlay-002);
    border-radius: var(--wui-border-radius-xs);
  }
`
