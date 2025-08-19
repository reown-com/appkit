import { css } from '@reown/appkit-ui'

export default css`
  wui-separator {
    margin: ${({ spacing }) => spacing['3']} calc(${({ spacing }) => spacing['3']} * -1)
      ${({ spacing }) => spacing['3']} calc(${({ spacing }) => spacing['3']} * -1);
    width: calc(100% + ${({ spacing }) => spacing['3']} * 2);
  }
`
