import { css } from 'lit'

export default css`
  wui-overlay {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  wui-card {
    max-width: 360px;
  }

  @media (max-width: 360px) {
    wui-overlay {
      align-items: flex-end;
    }
  }
`
