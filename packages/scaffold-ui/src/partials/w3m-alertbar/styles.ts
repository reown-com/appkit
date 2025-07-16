import { css } from 'lit'

export default css`
  :host {
    display: block;
    position: absolute;
    top: var(--apkt-spacing-3);
    left: var(--apkt-spacing-4);
    right: var(--apkt-spacing-4);
    opacity: 0;
    pointer-events: none;
  }
`
