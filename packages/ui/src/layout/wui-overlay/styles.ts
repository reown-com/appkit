import { css } from 'lit'

export default css`
  :host {
    display: block;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    position: fixed;
    overflow-x: hidden;
    overflow-y: auto;
    background-color: var(--wui-cover);
    z-index: var(--wui-z-index);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @media (max-height: 500px) {
    :host {
      display: flex;
      align-items: flex-start;
      justify-content: center;
    }

    ::slotted(wui-card) {
      margin: 24px 0px;
    }
  }
`
