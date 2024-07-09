import { css } from 'lit'

export default css`
  :host > wui-flex {
    width: 400px;
    height: 800px;
  }

  :host > wui-flex > wui-flex {
    border-radius: var(--wui-border-radius-l);
    width: 100%;
  }

  :host > wui-flex > iframe {
    width: 100%;
    height: 100%;
  }

  .amounts-container {
    width: 100%;
  }
`
