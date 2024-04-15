import { css } from 'lit'

export default css`
  wui-flex:first-child {
    margin-top: var(--wui-spacing-xxs);
  }

  wui-separator {
    margin: var(--wui-spacing-m) calc(var(--wui-spacing-m) * -1) var(--wui-spacing-m)
      calc(var(--wui-spacing-m) * -1);
    width: calc(100% + var(--wui-spacing-s) * 2);
  }
`
