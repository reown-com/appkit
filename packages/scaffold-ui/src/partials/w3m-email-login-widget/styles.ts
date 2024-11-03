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
  }

  wui-icon-link,
  wui-loading-spinner {
    position: absolute;
  }

  wui-icon-link {
    top: 13px;
    right: var(--wui-spacing-xs);
  }

  wui-loading-spinner {
    top: 19px;
    right: var(--wui-spacing-m);
  }
`
