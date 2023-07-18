import { css } from 'lit'

export default css`
  wui-grid {
    max-height: 360px;
    overflow: scroll;
    scrollbar-width: none;
  }

  wui-grid::-webkit-scrollbar {
    display: none;
  }
`
