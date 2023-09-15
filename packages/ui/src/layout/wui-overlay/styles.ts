import { css } from 'lit'

export default css`
  :host {
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    position: fixed;
    overflow-x: hidden;
    overflow-y: auto;
    background-color: var(--wui-cover);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @media (max-height: 700px) and (min-width: 431px) {
    :host {
      align-items: flex-start;
    }

    ::slotted(wui-card) {
      margin: var(--wui-spacing-xxl) 0px;
    }
  }
`
