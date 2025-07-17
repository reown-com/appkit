import { css } from 'lit'

export default css`
  :host > wui-flex {
    background-color: var(--apkt-tokens-core-glass010);
  }

  :host wui-ux-by-reown {
    padding-top: 0;
  }

  :host wui-ux-by-reown.branding-only {
    padding-top: var(--apkt-spacing-3);
  }

  a {
    text-decoration: none;
    color: var(--apkt-tokens-theme-foregroundSecondary);
    font-weight: 500;
  }
`
