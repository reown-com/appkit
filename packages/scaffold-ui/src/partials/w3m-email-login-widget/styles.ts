import { css } from 'lit'

export default css`
  wui-separator {
    margin: var(--apkt-spacing-3) calc(var(--apkt-spacing-3) * -1);
    width: calc(100% + var(--apkt-spacing-3) * 2);
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
    top: 50%;
    transform: translateY(-50%);
  }

  wui-icon-link {
    right: var(--apkt-spacing-2);
  }

  wui-loading-spinner {
    right: var(--apkt-spacing-3);
  }

  wui-text {
    margin: var(--apkt-spacing-2) var(--apkt-spacing-3) var(--apkt-spacing-0) var(--apkt-spacing-3);
  }
`
