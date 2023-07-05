import { css } from 'lit'

export default css`
  :host {
    position: relative;
  }

  wui-input-element {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 14px;
  }
`
