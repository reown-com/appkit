import { css } from 'lit'

export default css`
  :host {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;
    background-color: var(--wui-overlay-020);
    background-color: color-mix(in srgb, var(--local-bg-value) var(--local-bg-mix), transparent);
    border-radius: var(--local-border-radius);
    border: var(--local-border);
    width: var(--local-size);
    height: var(--local-size);
  }

  :host[opaque='blue-100'] {
    background-color: var(--wui-icon-box-bg-blue-100);
  }

  :host[opaque='error-100'] {
    background-color: var(--wui-icon-box-bg-error-100);
  }
`
