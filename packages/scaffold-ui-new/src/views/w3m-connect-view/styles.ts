import { css } from '@reown/appkit-ui-new'

export default css`
  :host {
    display: block;
    background-color: ${({ tokens }) => tokens.theme.foregroundSecondary};
    border-radius: ${({ borderRadius }) => borderRadius[8]};
  }

  :host > wui-flex:first-child {
    max-height: clamp(360px, 578px, 80vh);
    scrollbar-width: none;
    overflow-y: scroll;
    overflow-x: hidden;
    background-color: ${({ tokens }) => tokens.theme.backgroundPrimary};
    border: 4px solid ${({ tokens }) => tokens.theme.foregroundSecondary};
    border-radius: ${({ borderRadius }) => borderRadius[8]};
    box-sizing: border-box;
  }
`
