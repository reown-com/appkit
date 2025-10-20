import { css } from '@laughingwhales/appkit-ui'

export default css`
  :host {
    display: flex;
    justify-content: center;
    gap: ${({ spacing }) => spacing['4']};
  }

  wui-visual-thumbnail:nth-child(1) {
    z-index: 1;
  }
`
