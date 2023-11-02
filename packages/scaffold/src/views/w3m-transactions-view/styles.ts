import { css } from 'lit'

export default css`
  wui-flex {
    height: 500px;
    overflow: scroll;
    scrollbar-width: none;
  }

  wui-flex::-webkit-scrollbar {
    display: none;
  }
`
