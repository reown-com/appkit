import { css } from 'lit'

export default css`
  :host {
    display: flex;
  }

  .wui-size-xxs::slotted(svg) {
    width: 8px;
    height: 8px;
  }

  .wui-size-xs::slotted(svg) {
    width: 10px;
    height: 10px;
  }

  .wui-size-sm::slotted(svg) {
    width: 12px;
    height: 12px;
  }

  .wui-size-md::slotted(svg) {
    width: 14px;
    height: 14px;
  }

  .wui-size-lg::slotted(svg) {
    width: 18px;
    height: 18px;
  }

  .wui-size-inherit::slotted(svg) {
    width: inherit;
    height: inherit;
  }
`
