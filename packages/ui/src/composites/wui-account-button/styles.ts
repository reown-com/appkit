import { css } from 'lit'

export default css`
  :host {
    display: block;
  }

  button {
    border-radius: var(--wui-border-radius-3xl);
    background: var(--wui-overlay-002);
    display: flex;
    gap: var(--wui-spacing-xs);
    padding: var(--wui-spacing-3xs) var(--wui-spacing-xs) var(--wui-spacing-3xs)
      var(--wui-spacing-xs);
  }

  button:has(wui-image) {
    padding: var(--wui-spacing-3xs) var(--wui-spacing-3xs) var(--wui-spacing-3xs)
      var(--wui-spacing-xs);
  }

  wui-image {
    border-radius: var(--wui-border-radius-3xl);
    width: 24px;
    height: 24px;
  }

  wui-flex {
    border-radius: var(--wui-border-radius-3xl);
    border: 1px solid var(--wui-overlay-010);
    background: var(--wui-color-blue-100);
    padding: 5px var(--wui-spacing-m) 5px var(--wui-spacing-xxs);
  }

  wui-avatar {
    width: 20px;
    height: 20px;
    border: 2px solid var(--wui-color-blue-080);
  }
`
