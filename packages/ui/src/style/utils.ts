import { css, unsafeCSS } from 'lit'

export function scss(encapsulatingString: TemplateStringsArray, scssImport: string) {
  return css`
    ${unsafeCSS(`${scssImport}\n${encapsulatingString.join('\n')}`)}
  `
}
