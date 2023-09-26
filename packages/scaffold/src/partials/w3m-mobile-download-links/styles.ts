import { css } from 'lit'

export default css`
  :host {
    display: block;
    width: 100%;
  }

  wui-separator {
    width: calc(100% + var(--wui-spacing-xl) * 2);
    margin: 0 calc(var(--wui-spacing-xl) * -1) var(--wui-spacing-xl);
  }
`
