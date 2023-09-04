import { css } from 'lit'

export default css`
  wui-flex {
    max-height: 420px;
    overflow: scroll;
    scrollbar-width: none;
  }

  wui-flex::-webkit-scrollbar {
    display: none;
  }
`
