import { css, html } from 'lit'
import { color } from '../../utils/Theme'

export default css`
  w3m-modal-content {
    display: flex;
    height: 70vh;
    overflow: scroll;
    scrollbar-width: none;
    position: relative;
  }

  w3m-modal-content::before,
  w3m-modal-content::after {
    content: '';
    position: fixed;
    pointer-events: none;
    z-index: 1;
    width: 100%;
    height: 18px;
    opacity: 1;
  }

  .w3m-explorer-search {
    border-radius: 16px;
    height: 100%;
    width: 75%;
    padding-left: 0.5em;
    margin-bottom: 1px;
    height: 1.5em;
    display: flex;
  }

  .w3m-explorer-search input {
    background: none;
    width: 100%;
    padding: 0.25em 0;
    outline: none;
    border: none;
  }

  .w3m-first-fetch {
    justify-content: center;
    align-items: center;
  }

  .w3m-first-fetch::after,
  .w3m-first-fetch::before {
    opacity: 0;
  }

  w3m-modal-content::-webkit-scrollbar {
    display: none;
  }

  .w3m-content {
    display: grid;
    grid-template-columns: repeat(4, auto);
  }

  .w3m-spinner-block,
  .w3m-centered-block {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px;
    overflow: hidden;
  }

  .w3m-end-reached .w3m-spinner-block {
    height: 18px;
    opacity: 0;
  }

  w3m-wallet-button {
    margin: calc((100% - 60px) / 3) 0;
  }
`

export function dynamicStyles() {
  const { background, foreground } = color()

  return html`
    <style>
      w3m-modal-content::before {
        box-shadow: 0 -1px 0 0 ${background[1]};
        background: linear-gradient(${background[1]}, transparent);
      }

      .w3m-explorer-search {
        background: ${background[2]};
      }

      .w3m-explorer-search:active,
      .w3m-explorer-search:focus-within {
        border: solid 1px ${foreground.accent};
        background: ${background[3]};
      }

      .w3m-explorer-search input:focus {
        color: ${foreground[1]};
      }

      w3m-modal-content::after {
        box-shadow: 0 1px 0 0 ${background[1]};
        background: linear-gradient(transparent, ${background[1]});
        top: calc(100% - 18px);
      }
    </style>
  `
}
