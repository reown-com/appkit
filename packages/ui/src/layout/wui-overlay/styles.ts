import { css } from 'lit'

export default css`
  :host {
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    position: fixed;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--wui-cover);
    z-index: var(--wui-z-index);
  }

  @media (max-width: 360px) {
    :host {
      align-items: flex-end;
    }
  }
`
