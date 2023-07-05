import { css } from 'lit'

export default css`
  :host {
    display: block;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    position: fixed;
    overflow: hidden;
    background-color: var(--wui-cover);
    z-index: var(--wui-z-index);
  }
`
