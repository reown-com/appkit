import { css } from 'lit'

export default css`
  div:first-of-type {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;
  }

  .wui-size-sm {
    width: 20px;
    height: 20px;
    border-radius: 100px;
  }

  .wui-size-md {
    width: 24px;
    height: 24px;
    border-radius: 100px;
  }

  .wui-size-lg {
    width: 40px;
    height: 40px;
    border-radius: 12px;
  }
`
