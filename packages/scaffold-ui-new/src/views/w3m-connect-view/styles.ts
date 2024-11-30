import { css } from '@reown/appkit-ui-new'

export default css`
  :host {
    display: block;
    background-color: ${({ tokens }) => tokens.theme.foregroundSecondary};
    border: 4px solid ${({ tokens }) => tokens.theme.foregroundSecondary};
    border-radius: ${({ borderRadius }) => borderRadius[8]};
    box-sizing: border-box;
  }

  .connect {
    background-color: ${({ tokens }) => tokens.theme.backgroundPrimary};
    border-radius: ${({ borderRadius }) => borderRadius[8]};
  }

  .scrollable {
    max-height: clamp(360px, 578px, 80vh);
    scrollbar-width: none;
    overflow-y: scroll;
    overflow-x: hidden;
  }

  @media (max-width: 430px) {
    :host {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
  }
`
