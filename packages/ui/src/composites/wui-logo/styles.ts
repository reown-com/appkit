import { css } from 'lit'

export default css`
  :host {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    border-radius: var(--apkt-borderRadius-20);
    overflow: hidden;
  }

  wui-icon {
    width: 100%;
    height: 100%;
  }
`
