import { css } from 'lit'

export default css`
  :host {
    display: flex;
    flex-direction: column;
    gap: var(--wui-spacing-l);
    padding: 17px 18px 17px var(--wui-spacing-m);
    width: 100%;
    background-color: var(--wui-gray-glass-002);
    border-radius: var(--wui-border-radius-xs);
    color: var(--wui-color-fg-250);
  }

  wui-image {
    width: 20px;
    height: 20px;
    border-radius: var(--wui-border-radius-3xl);
  }

  wui-icon {
    width: 20px;
    height: 20px;
  }
`
