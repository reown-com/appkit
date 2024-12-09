import { style } from '@vanilla-extract/css'

const input = style({
  appearance: 'none',
  border: 'none',
  '::placeholder': {
    opacity: 1
  },
  outline: 'none',
  selectors: {
    '&:disabled': {
      opacity: 0.5
    },
    '&::-ms-clear': {
      display: 'none'
    },
    '&::-webkit-search-cancel-button': {
      WebkitAppearance: 'none'
    }
  }
})

const button = style({
  appearance: 'none',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  textAlign: 'left',
  outline: 'none'
})

const a = style({
  textDecoration: 'none'
})

export const element = {
  a,
  button,
  input
}
