import { css } from 'lit'

export default css`
  :host {
    display: flex;
    justify-content: center;
    gap: var(--apkt-spacing-4);
  }

  wui-visual-thumbnail:nth-child(1) {
    z-index: 1;
  }
`
