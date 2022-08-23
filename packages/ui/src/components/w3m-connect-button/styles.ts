import { css, unsafeCSS } from 'lit'
import { color } from '../../utils/Theme'

const bg = unsafeCSS(color().foreground.accent)
const bgDisabled = unsafeCSS(color().background[3])
const bgLoading = unsafeCSS(color().background.accent)
const fontColor = unsafeCSS(color().foreground.inverse)
const fontColorDisabled = unsafeCSS(color().foreground[3])

export default css`
  button {
    border: none;
    transition: 0.2s filter ease-in-out;
    padding: 0 15px 1px;
    height: 40px;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    color: ${fontColor};
    background-color: ${bg};
  }

  .w3m-button-loading {
    padding: 0 15px;
  }

  .w3m-button-loading:disabled {
    background-color: ${bgLoading};
  }

  button:disabled {
    cursor: not-allowed;
    padding-bottom: 0;
    background-color: ${bgDisabled};
    color: ${fontColorDisabled};
  }

  svg {
    width: 28px;
    height: 20px;
    margin: -1px 3px 0 -5px;
  }

  svg path {
    fill: ${fontColor};
  }

  span {
    padding-top: 1px;
  }

  button:disabled svg path {
    fill: ${fontColorDisabled};
  }

  @media (prefers-color-scheme: dark) {
    button {
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
    }

    button:hover {
      filter: brightness(110%);
    }

    button:active {
      filter: brightness(120%);
    }
  }

  @media (prefers-color-scheme: light) {
    button {
      box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
    }

    button:hover {
      filter: brightness(90%);
    }

    button:active {
      filter: brightness(80%);
    }
  }
`
