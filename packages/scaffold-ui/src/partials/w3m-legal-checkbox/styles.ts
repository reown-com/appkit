import { css } from 'lit'

export default css`
  :host {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  wui-checkbox {
    padding: var(--apkt-spacing-3);
  }
  a {
    text-decoration: none;
    color: var(--wui-color-secondary);
    font-weight: 500;
  }
`
