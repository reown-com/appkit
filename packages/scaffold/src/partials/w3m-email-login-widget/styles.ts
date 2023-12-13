import { css } from 'lit'

export default css`
  wui-separator {
    margin: var(--wui-spacing-s) calc(var(--wui-spacing-s) * -1);
    width: calc(100% + var(--wui-spacing-s) * 2);
  }

  wui-email-input {
    width: 100%;
  }

  form {
    width: 100%;
    display: block;
    position: relative;
    padding-bottom: var(--wui-spacing-m);
  }

  wui-icon-link {
    position: absolute;
    right: var(--wui-spacing-xs);
    top: 11px;
  }

  wui-loading-spinner {
    position: absolute;
    right: var(--wui-spacing-1xs);
    top: var(--wui-spacing-m);
  }
`
