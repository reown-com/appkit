import { css } from 'lit'

export default css`
  :host {
    display: block;
    padding: 0 var(--wui-spacing-xl) var(--wui-spacing-xl);
  }

  wui-separator {
    width: calc(100% + var(--wui-spacing-xl) * 2);
    margin: 0 calc(var(--wui-spacing-xl) * -1) var(--wui-spacing-xl);
  }

  wui-list-item {
    flex: 1;
  }
`
