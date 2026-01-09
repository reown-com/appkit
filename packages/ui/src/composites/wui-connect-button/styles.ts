import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host {
    position: relative;
    display: block;
  }

  button {
    border-radius: ${({ borderRadius }) => borderRadius[2]};
  }

  button[data-size='sm'] {
    padding: ${({ spacing }) => spacing[2]};
  }

  button[data-size='md'] {
    padding: ${({ spacing }) => spacing[3]};
  }

  button[data-size='lg'] {
    padding: ${({ spacing }) => spacing[4]};
  }

  button[data-variant='primary'] {
    background: ${({ tokens }) => tokens.core.backgroundAccentPrimary};
  }

  button[data-variant='secondary'] {
    background: ${({ tokens }) => tokens.core.foregroundAccent010};
  }

  button:hover:enabled {
    border-radius: ${({ borderRadius }) => borderRadius[3]};
  }

  button:disabled {
    cursor: not-allowed;
  }

  button[data-loading='true'] {
    cursor: not-allowed;
  }

  button[data-loading='true'][data-size='sm'] {
    border-radius: ${({ borderRadius }) => borderRadius[32]};
    padding: ${({ spacing }) => spacing[2]} ${({ spacing }) => spacing[3]};
  }

  button[data-loading='true'][data-size='md'] {
    border-radius: ${({ borderRadius }) => borderRadius[20]};
    padding: ${({ spacing }) => spacing[3]} ${({ spacing }) => spacing[4]};
  }

  button[data-loading='true'][data-size='lg'] {
    border-radius: ${({ borderRadius }) => borderRadius[16]};
    padding: ${({ spacing }) => spacing[4]} ${({ spacing }) => spacing[5]};
  }
`
