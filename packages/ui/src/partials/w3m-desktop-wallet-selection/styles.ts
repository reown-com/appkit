import { css, html } from 'lit'
import { color } from '../../utils/Theme'

export default css`
  .w3m-view-row {
    display: flex;
    width: 100%;
    justify-content: space-between;
  }

  .w3m-mobile-title,
  .w3m-desktop-title {
    display: flex;
    align-items: center;
    margin-bottom: 18px;
    margin-top: -8px;
  }

  .w3m-mobile-title {
    justify-content: space-between;
  }

  .w3m-subtitle {
    display: flex;
    align-items: center;
  }

  .w3m-mobile-title svg,
  .w3m-desktop-title svg {
    margin-right: 6px;
  }
`

export function dynamicStyles() {
  const { foreground } = color()

  return html`<style>
    .w3m-mobile-title path,
    .w3m-desktop-title path {
      fill: ${foreground.accent};
    }

    .w3m-subtitle:last-child path {
      fill: ${foreground[3]};
    }
  </style>`
}
