import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host {
    position: relative;
    display: inline-block;
  }

  input {
    background: transparent;
    height: auto;
    box-sizing: border-box;
    color: ${({ tokens }) => tokens.theme.textPrimary};
    font-feature-settings: 'case' on;
    font-size: ${({ textSize }) => textSize.h4};
    caret-color: ${({ tokens }) => tokens.core.textAccentPrimary};
    line-height: 130%;
    letter-spacing: -1.28px;
    -webkit-appearance: none;
    -moz-appearance: textfield;
    padding: 0px;
    font-family: ${({ fontFamily }) => fontFamily.mono};
  }

  :host([data-width-variant='auto']) input {
    width: 100%;
  }

  :host([data-width-variant='fit']) input {
    width: 1ch;
  }

  .wui-input-amount-fit-mirror {
    position: absolute;
    visibility: hidden;
    white-space: pre;
    font-size: ${({ textSize }) => textSize.h4};
    line-height: 130%;
    letter-spacing: -1.28px;
    font-family: ${({ fontFamily }) => fontFamily.mono};
  }

  .wui-input-amount-fit-width {
    display: inline-block;
    position: relative;
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input::placeholder {
    color: ${({ tokens }) => tokens.theme.foregroundTertiary};
  }
`
