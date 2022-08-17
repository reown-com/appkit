import { css, unsafeCSS } from 'lit'
import color from '../../theme/color'

const bgLight = unsafeCSS(color().light.foreground.accent)
const bgDark = unsafeCSS(color().dark.foreground.accent)
const bgLightDisabled = unsafeCSS(color().light.background[3])
const bgDarkDisabled = unsafeCSS(color().dark.background[3])
const bgLightLoading = unsafeCSS(color().light.background.accent)
const bgDarkLoading = unsafeCSS(color().dark.background.accent)
const fontColor = unsafeCSS(color().light.foreground.inverse)
const fontColorLightDisabled = unsafeCSS(color().light.foreground[3])
const fontColorDarkDisabled = unsafeCSS(color().dark.foreground[3])

export default css`
  button {
    border: none;
    transition: 0.2s filter ease-in-out;
    padding: 0 15px 2px;
    height: 40px;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    color: ${fontColor};
  }

  .w3m-button-loading {
    padding: 0 15px;
  }

  button:disabled {
    cursor: not-allowed;
    padding-bottom: 0;
  }

  svg {
    width: 28px;
    height: 20px;
    margin: 0 3px 0 -5px;
  }

  svg path {
    fill: ${fontColor};
  }

  span {
    padding-top: 1px;
  }

  @media (prefers-color-scheme: dark) {
    button {
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
      background-color: ${bgDark};
    }

    button:hover {
      filter: brightness(110%);
    }

    button:active {
      filter: brightness(120%);
    }

    button:disabled {
      background-color: ${bgDarkDisabled};
      color: ${fontColorDarkDisabled};
    }

    button:disabled svg path {
      fill: ${fontColorDarkDisabled};
    }

    .w3m-button-loading:disabled {
      background-color: ${bgDarkLoading};
    }
  }

  @media (prefers-color-scheme: light) {
    button {
      box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
      background-color: ${bgLight};
    }

    button:hover {
      filter: brightness(90%);
    }

    button:active {
      filter: brightness(80%);
    }

    button:disabled {
      background-color: ${bgLightDisabled};
      color: ${fontColorLightDisabled};
    }

    button:disabled svg path {
      fill: ${fontColorLightDisabled};
    }

    .w3m-button-loading:disabled {
      background-color: ${bgLightLoading};
    }
  }
`
