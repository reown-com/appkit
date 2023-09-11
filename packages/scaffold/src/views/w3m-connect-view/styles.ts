import { css } from 'lit'

export default css`
  wui-flex {
    max-height: clamp(420px, calc(80vh), 500px);
    overflow: scroll;
    scrollbar-width: none;
  }

  wui-flex::-webkit-scrollbar {
    display: none;
  }
`
