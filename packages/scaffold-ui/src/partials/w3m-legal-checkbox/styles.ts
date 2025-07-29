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
    color: var(--apkt-tokens-theme-textSecondary);
    font-weight: 500;
  }
`
