import { css, html } from 'lit'
import { color } from '../../utils/Theme'

export default css`
  :host {
    position: relative;
    height: 28px;
    width: 75%;
  }

  input {
    width: 100%;
    height: 100%;
    line-height: 28px;
    border-radius: 28px;
    font-style: normal;
    font-family: -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu,
      'Helvetica Neue', sans-serif;
    font-feature-settings: 'case' on;
    font-weight: 500;
    font-size: 16px;
    letter-spacing: -0.03em;
    padding: 0 10px 0 34px;
    transition: 0.2s all ease-in-out;
    color: transparent;
    position: absolute;
  }

  input::placeholder {
    color: transparent;
  }

  svg {
    margin-right: 4px;
  }

  .w3m-placeholder {
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    transition: 0.2s all ease-in-out;
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: fit-content;
    position: relative;
  }

  input:focus-within + .w3m-placeholder,
  input:not(:placeholder-shown) + .w3m-placeholder {
    transform: translateX(10px);
    left: 0;
  }

  w3m-text {
    opacity: 1;
    transition: 0.2s opacity ease-in-out;
  }

  input:focus-within + .w3m-placeholder w3m-text,
  input:not(:placeholder-shown) + .w3m-placeholder w3m-text {
    opacity: 0;
  }
`

export function dynamicStyles() {
  const { background, overlay, foreground } = color()

  return html`<style>
    input {
      background-color: ${background[3]};
      box-shadow: inset 0 0 0 1px ${overlay.thin};
    }

    input:focus-within,
    input:not(:placeholder-shown) {
      color: ${foreground[1]};
    }

    input:focus-within {
      box-shadow: inset 0 0 0 1px ${foreground.accent};
    }

    path {
      fill: ${foreground[2]};
    }
  </style>`
}
