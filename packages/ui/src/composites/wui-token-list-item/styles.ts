import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host {
    width: 100%;
    height: 60px;
    min-height: 60px;
  }

  :host > wui-flex {
    cursor: pointer;
    height: 100%;
    display: flex;
    column-gap: ${({ spacing }) => spacing['3']};
    padding: ${({ spacing }) => spacing['2']};
    padding-right: ${({ spacing }) => spacing['4']};
    width: 100%;
    background-color: transparent;
    border-radius: ${({ borderRadius }) => borderRadius['4']};
    color: ${({ tokens }) => tokens.theme.foregroundSecondary};
    transition:
      background-color ${({ durations }) => durations['lg']}
        ${({ easings }) => easings['ease-out-power-2']},
      opacity ${({ durations }) => durations['lg']} ${({ easings }) => easings['ease-out-power-2']};
    will-change: background-color, opacity;
  }

  @media (hover: hover) and (pointer: fine) {
    :host > wui-flex:hover {
      background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
    }

    :host > wui-flex:active {
      background-color: ${({ tokens }) => tokens.core.glass010};
    }
  }

  :host([disabled]) > wui-flex {
    opacity: 0.6;
  }

  :host([disabled]) > wui-flex:hover {
    background-color: transparent;
  }

  :host > wui-flex > wui-flex {
    flex: 1;
  }

  wui-image.token-image,
  :host > wui-flex > .token-item-image-placeholder {
    width: 40px;
    max-width: 40px;
    height: 40px;
    border-radius: ${({ borderRadius }) => borderRadius['20']};
    position: relative;
  }

  wui-image.chain-image {
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: ${({ borderRadius }) => borderRadius[32]};
    bottom: -2px;
    right: -6px;
    border: 1px solid ${({ tokens }) => tokens.theme.foregroundPrimary};
  }

  :host > wui-flex > .token-item-image-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  wui-image.token-image::after,
  :host > wui-flex > .token-item-image-placeholder::after {
    position: absolute;
    content: '';
    inset: 0;
    box-shadow: inset 0 0 0 1px ${({ tokens }) => tokens.core.glass010};
    border-radius: ${({ borderRadius }) => borderRadius['8']};
  }

  button > wui-icon-box[data-variant='square-blue'] {
    border-radius: ${({ borderRadius }) => borderRadius['2']};
    position: relative;
    border: none;
    width: 36px;
    height: 36px;
  }

  .left-image-container {
    position: relative;
    justify-content: flex-start;
    align-items: center;
    max-width: fit-content;
  }
`
