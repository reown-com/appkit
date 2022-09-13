import { css, html } from 'lit'
import { color } from '../../utils/Theme'

export default css`
  .w3m-view-row {
    display: flex;
    width: 100%;
    justify-content: space-between;
  }

  w3m-walletconnect-button {
    width: 100%;
    overflow: hidden;
    margin-right: calc((100% - 240px) / 3);
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
