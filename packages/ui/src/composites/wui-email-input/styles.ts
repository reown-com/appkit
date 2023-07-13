import { css } from 'lit'

export default css`
  :host {
    position: relative;
    display: inline-block;
  }

  wui-icon {
    padding: 16px;
    cursor: pointer;
    transition: all var(--wui-duration-lg) var(--wui-ease-in-power-1);
  }

  wui-icon:hover {
    color: var(--wui-color-fg-200) !important;
  }

  wui-icon::part(chevronRight) {
    width: 12px;
    height: 12px;
  }

  wui-text {
    margin: 6px 14px 0px 14px;
  }
`
