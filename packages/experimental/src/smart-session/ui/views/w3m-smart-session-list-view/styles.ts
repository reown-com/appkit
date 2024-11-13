import { css } from 'lit'

export default css`
  wui-flex {
    width: 100%;
  }

  wui-tabs {
    width: 100%;
  }

  :host {
    min-height: 100%;
  }

  .group-container {
    max-height: 400px;
    border-bottom-left-radius: var(--wui-border-radius-xs);
    border-bottom-right-radius: var(--wui-border-radius-xs);
    overflow: scroll;
  }

  .group-container[last-group='true'] {
    padding-bottom: var(--wui-spacing-m);
  }

  .session-container {
    background-color: var(--wui-color-bg-125);
    border-radius: var(--wui-border-radius-xs);
    cursor: pointer;
  }

  .session-project-image {
    border-radius: var(--wui-border-radius-3xs);
    width: 40px;
    height: 40px;
  }
`
