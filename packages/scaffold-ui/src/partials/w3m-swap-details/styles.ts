import { css } from '@reown/appkit-ui'

export default css`
  :host {
    width: 100%;
  }

  .details-container > wui-flex {
    background: ${({ tokens }) => tokens.theme.foregroundPrimary};
    border-radius: ${({ borderRadius }) => borderRadius['3']};
    width: 100%;
  }

  .details-container > wui-flex > button {
    border: none;
    background: none;
    padding: ${({ spacing }) => spacing['3']};
    border-radius: ${({ borderRadius }) => borderRadius['3']};
    cursor: pointer;
  }

  .details-content-container {
    padding: ${({ spacing }) => spacing['2']};
    padding-top: 0px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .details-content-container > wui-flex {
    width: 100%;
  }

  .details-row {
    width: 100%;
    padding: ${({ spacing }) => spacing['3']};
    padding-left: ${({ spacing }) => spacing['3']};
    padding-right: ${({ spacing }) => spacing['2']};
    border-radius: calc(
      ${({ borderRadius }) => borderRadius['1']} + ${({ borderRadius }) => borderRadius['1']}
    );
    background: ${({ tokens }) => tokens.theme.foregroundPrimary};
  }

  .details-row-title {
    white-space: nowrap;
  }

  .details-row.provider-free-row {
    padding-right: ${({ spacing }) => spacing['2']};
  }
`
