import { css } from 'lit'

export default css`
  :host > wui-flex:first-child {
    height: 500px;
    overflow: scroll;
    scrollbar-width: none;
  }

  wui-flex::-webkit-scrollbar {
    display: none;
  }
`
