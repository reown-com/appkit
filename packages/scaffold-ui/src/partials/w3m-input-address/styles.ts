import { css } from '@reown/appkit-ui'

export default css`
  :host {
    width: 100%;
    height: 100px;
    border-radius: ${({ borderRadius }) => borderRadius['5']};
    border: 1px solid ${({ tokens }) => tokens.theme.foregroundPrimary};
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
    transition: background-color ${({ durations }) => durations['lg']}
      ${({ easings }) => easings['ease-out-power-1']};
    will-change: background-color;
    position: relative;
  }

  :host(:hover) {
    background-color: ${({ tokens }) => tokens.theme.foregroundSecondary};
  }

  wui-flex {
    width: 100%;
    height: fit-content;
  }

  wui-button {
    display: ruby;
    color: ${({ tokens }) => tokens.theme.textPrimary};
    margin: 0 ${({ spacing }) => spacing['2']};
  }

  .instruction {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2;
  }

  .paste {
    display: inline-flex;
  }

  textarea {
    background: transparent;
    width: 100%;
    font-family: ${({ fontFamily }) => fontFamily.regular};
    font-style: normal;
    font-weight: var(--apkt-font-weight-light);
    line-height: 130%;
    letter-spacing: ${({ typography }) => typography['md-medium'].letterSpacing};
    color: ${({ tokens }) => tokens.theme.textPrimary};
    caret-color: ${({ tokens }) => tokens.core.textAccentPrimary};
    box-sizing: border-box;
    -webkit-appearance: none;
    -moz-appearance: textfield;
    padding: 0px;
    border: none;
    outline: none;
    appearance: none;
    resize: none;
    overflow: hidden;
  }
`
