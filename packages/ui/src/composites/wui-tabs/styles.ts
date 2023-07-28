import { css } from 'lit'

export default css`
  :host {
    display: flex;
    background-color: var(--wui-overlay-002);
    border-radius: var(--wui-border-radius-3xl);
    padding: var(--wui-spacing-3xs);
    position: relative;
    height: 36px;
  }

  :host::before {
    content: '';
    position: absolute;
    pointer-events: none;
    top: 4px;
    left: 4px;
    display: block;
    width: 100px;
    height: 28px;
    border-radius: var(--wui-border-radius-3xl);
    background-color: var(--wui-overlay-002);
    box-shadow: inset 0 0 0 1px var(--wui-overlay-002);
  }

  ::slotted(*) {
    width: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`
