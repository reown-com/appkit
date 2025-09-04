import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  wui-flex {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${({ spacing }) => spacing[2]};
    border-radius: ${({ borderRadius }) => borderRadius[4]};
    padding: ${({ spacing }) => spacing[3]};
  }

  /* -- Types --------------------------------------------------------- */
  wui-flex[data-type='info'] {
    color: ${({ tokens }) => tokens.theme.textSecondary};
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
  }

  wui-flex[data-type='success'] {
    color: ${({ tokens }) => tokens.core.textSuccess};
    background-color: ${({ tokens }) => tokens.core.backgroundSuccess};
  }

  wui-flex[data-type='error'] {
    color: ${({ tokens }) => tokens.core.textError};
    background-color: ${({ tokens }) => tokens.core.backgroundError};
  }

  wui-flex[data-type='warning'] {
    color: ${({ tokens }) => tokens.core.textWarning};
    background-color: ${({ tokens }) => tokens.core.backgroundWarning};
  }

  wui-flex[data-type='info'] wui-icon-box {
    background-color: ${({ tokens }) => tokens.theme.foregroundSecondary};
  }

  wui-flex[data-type='success'] wui-icon-box {
    background-color: ${({ tokens }) => tokens.core.backgroundSuccess};
  }

  wui-flex[data-type='error'] wui-icon-box {
    background-color: ${({ tokens }) => tokens.core.backgroundError};
  }

  wui-flex[data-type='warning'] wui-icon-box {
    background-color: ${({ tokens }) => tokens.core.backgroundWarning};
  }

  wui-text {
    flex: 1;
  }
`
