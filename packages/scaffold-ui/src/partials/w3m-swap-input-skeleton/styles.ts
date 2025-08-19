import { css } from '@reown/appkit-ui'

export default css`
  :host {
    width: 100%;
  }

  :host > wui-flex {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border-radius: ${({ borderRadius }) => borderRadius['5']};
    padding: ${({ spacing }) => spacing['5']};
    padding-right: ${({ spacing }) => spacing['3']};
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
    box-shadow: inset 0px 0px 0px 1px ${({ tokens }) => tokens.theme.foregroundPrimary};
    width: 100%;
    height: 100px;
    box-sizing: border-box;
    position: relative;
  }

  wui-shimmer.market-value {
    opacity: 0;
  }

  :host > wui-flex > svg.input_mask {
    position: absolute;
    inset: 0;
    z-index: 5;
  }

  :host wui-flex .input_mask__border,
  :host wui-flex .input_mask__background {
    transition: fill ${({ durations }) => durations['md']}
      ${({ easings }) => easings['ease-out-power-1']};
    will-change: fill;
  }

  :host wui-flex .input_mask__border {
    fill: ${({ tokens }) => tokens.core.glass010};
  }

  :host wui-flex .input_mask__background {
    fill: ${({ tokens }) => tokens.theme.foregroundPrimary};
  }
`
