import { css } from 'lit'
import fonts from './fonts'

export default css`
  *,
  *::after,
  *::before {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    ${fonts().fontFamily}
  }
`
