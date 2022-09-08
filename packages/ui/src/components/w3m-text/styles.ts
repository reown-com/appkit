import { css, html } from 'lit'
import { color } from '../../utils/Theme'

export default css`
  .w3m-font {
    font-style: normal;
    font-family: -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu,
      'Helvetica Neue', sans-serif;
    font-feature-settings: 'case' on;
  }

  .w3m-font-xxsmall-bold {
    font-weight: 700;
    font-size: 10px;
    line-height: 12px;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  .w3m-font-xsmall-normal {
    font-weight: 600;
    font-size: 12px;
    line-height: 14px;
    letter-spacing: -0.03em;
  }

  .w3m-font-small-thin {
    font-weight: 500;
    font-size: 14px;
    line-height: 16px;
    letter-spacing: -0.03em;
  }

  .w3m-font-small-normal {
    font-weight: 600;
    font-size: 14px;
    line-height: 16px;
    letter-spacing: -0.03em;
  }

  .w3m-font-medium-thin {
    font-weight: 500;
    font-size: 16px;
    line-height: 20px;
    letter-spacing: -0.03em;
  }

  .w3m-font-medium-normal {
    font-weight: 600;
    font-size: 16px;
    line-height: 20px;
    letter-spacing: -0.03em;
  }

  .w3m-font-medium-bold {
    font-weight: 700;
    font-size: 16px;
    line-height: 20px;
    letter-spacing: -0.03em;
  }

  .w3m-font-large-bold {
    font-weight: 700;
    font-size: 20px;
    line-height: 24px;
    letter-spacing: -0.03em;
  }

  .w3m-font-left {
    text-align: left;
  }

  .w3m-font-center {
    text-align: center;
  }

  .w3m-font-right {
    text-align: right;
  }
`

export function dynamicStyles() {
  const { foreground, error } = color()

  return html`<style>
    .w3m-color-primary {
      color: ${foreground[1]};
    }

    .w3m-color-secondary {
      color: ${foreground[2]};
    }

    .w3m-color-tertiary {
      color: ${foreground[3]};
    }

    .w3m-color-inverse {
      color: ${foreground.inverse};
    }

    .w3m-color-accnt {
      color: ${foreground.accent};
    }

    .w3m-color-error {
      color: ${error};
    }
  </style>`
}
