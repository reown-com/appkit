import { css } from 'lit'

export default css`
  wui-grid {
    height: 360px;
    overflow: scroll;
    scrollbar-width: none;
  }

  wui-grid[data-scroll='false'] {
    overflow: hidden;
  }

  wui-grid::-webkit-scrollbar {
    display: none;
  }

  wui-loading-spinner {
    height: 360px;
    justify-content: center;
    align-items: center;
  }
`
