import { css } from 'lit'

export default css`
  :host > wui-flex {
    width: 100%;
    max-width: 360px;
  }

  :host > wui-flex > wui-flex {
    border-radius: var(--apkt-borderRadius-8);
    width: 100%;
  }

  .amounts-container {
    width: 100%;
  }
`
