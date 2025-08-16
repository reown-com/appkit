import { css } from '@reown/appkit-ui'

export default css`
  wui-separator {
    margin: ${({ spacing }) => spacing['3']} calc(${({ spacing }) => spacing['3']} * -1);
    width: calc(100% + ${({ spacing }) => spacing['3']} * 2);
  }

  wui-email-input {
    width: 100%;
  }

  form {
    width: 100%;
    display: block;
    position: relative;
  }

  wui-icon-link,
  wui-loading-spinner {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }

  wui-icon-link {
    right: ${({ spacing }) => spacing['2']};
  }

  wui-loading-spinner {
    right: ${({ spacing }) => spacing['3']};
  }

  wui-text {
    margin: ${({ spacing }) => spacing['2']} ${({ spacing }) => spacing['3']}
      ${({ spacing }) => spacing['0']} ${({ spacing }) => spacing['3']};
  }
`
