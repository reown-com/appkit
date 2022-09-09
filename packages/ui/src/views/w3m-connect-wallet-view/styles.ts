import { css, html } from 'lit'
import { color } from '../../utils/Theme'

export default css`
  .w3m-view-row {
    display: grid;
    grid-auto-flow: column;
    grid-gap: calc((100% - 240px) / 3);
    width: 100%;
    justify-content: space-between;
  }

  w3m-walletconnect-button {
    width: 100%;
    overflow: hidden;
  }

  .w3m-footer-actions {
    display: flex;
  }

  .w3m-footer-actions w3m-button {
    margin: 0 5px;
  }

  .w3m-title {
    display: flex;
    align-items: center;
    padding: 6px 0;
    margin-bottom: 5px;
  }

  .w3m-title-desktop {
    margin-top: 15px;
  }

  .w3m-title svg {
    margin-right: 6px;
  }
`

export function dynamicStyles() {
  const { foreground } = color()

  return html`<style>
    .w3m-title path {
      fill: ${foreground[3]};
    }
  </style>`
}
