import { LitElement, html, svg, TemplateResult } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import QRCodeUtil from 'qrcode'
import styles from './styles'
import { global } from '../../utils/Theme'

@customElement('w3m-qrcode')
export default class QRCode extends LitElement {
  public static styles = [global, styles]
  @property() public uri: string = 'uri'
  @property() public logo: string = 'uri'
  @property() public size: number = 200
  @property() public logoSize: number = 50
  @property() public logoMargin: number = 10
  @property() public logoBackground: string = 'black'

  public constructor() {
    super()
  }

  private generateMatrix(
    value: string,
    errorCorrectionLevel: QRCodeUtil.QRCodeErrorCorrectionLevel
  ) {
    const arr = Array.prototype.slice.call(
      QRCodeUtil.create(value, { errorCorrectionLevel }).modules.data,
      0
    )
    const sqrt = Math.sqrt(arr.length)
    return arr.reduce(
      (rows, key, index) =>
        (index % sqrt === 0 ? rows.push([key]) : rows[rows.length - 1].push(key)) && rows,
      []
    )
  }

  private generateDots() {
    const dots: TemplateResult[] = []
    const matrix = this.generateMatrix(this.uri, 'quartile')
    const cellSize = this.size / matrix.length
    let qrList = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 }
    ]

    qrList.forEach(({ x, y }) => {
      const x1 = (matrix.length - 7) * cellSize * x
      const y1 = (matrix.length - 7) * cellSize * y
      for (let i = 0; i < 3; i++) {
        dots.push(
          svg`
            <rect
              fill=${i % 2 !== 0 ? 'white' : 'black'}
              height=${cellSize * (7 - i * 2)}
              rx=${(i - 2) * -5 + (i === 0 ? 2 : 0)} 
              ry=${(i - 2) * -5 + (i === 0 ? 2 : 0)}
              width=${cellSize * (7 - i * 2)}
              x=${x1 + cellSize * i}
              y=${y1 + cellSize * i}
            />
          `
        )
      }
    })

    const clearArenaSize = Math.floor((this.logoSize + 25) / cellSize)
    const matrixMiddleStart = matrix.length / 2 - clearArenaSize / 2
    const matrixMiddleEnd = matrix.length / 2 + clearArenaSize / 2 - 1
    matrix.forEach((row: QRCodeUtil.QRCode[], i: number) => {
      row.forEach((_: any, j: number) => {
        if (matrix[i][j]) {
          if (
            !(
              (i < 7 && j < 7) ||
              (i > matrix.length - 8 && j < 7) ||
              (i < 7 && j > matrix.length - 8)
            )
          ) {
            if (
              !(
                i > matrixMiddleStart &&
                i < matrixMiddleEnd &&
                j > matrixMiddleStart &&
                j < matrixMiddleEnd
              )
            ) {
              dots.push(
                svg`
                  <circle
                    cx=${i * cellSize + cellSize / 2}
                    cy=${j * cellSize + cellSize / 2}
                    fill="black"
                    r=${cellSize / 3} 
                  />
                `
              )
            }
          }
        }
      })
    })

    return dots
  }

  protected render() {
    const logoPosition = this.size / 2 - this.logoSize / 2
    const logoWrapperSize = this.logoSize + this.logoMargin * 2
    const innerSvg = svg`
        <defs>
          <clipPath id="clip-wrapper">
            <rect height=${logoWrapperSize} width=${logoWrapperSize} />
          </clipPath>
          <clipPath id="clip-logo">
            <rect height=${this.logoSize} width=${this.logoSize} />
          </clipPath>
        </defs>
        <rect fill="transparent" height=${this.size} width=${this.size} />
    `
    return html`
      <div class="w3m-qrcode" style="width: ${this.size}; height: ${this.size}">
        <div class="w3m-logo-image" style="top: ${logoPosition}px; width: ${this.size}">
          <img
            style="background: ${this.logoBackground}"
            src=${this.logo}
            width=${this.logoSize}
            height=${this.logoSize}
          />
        </div>
        <svg height=${this.size} width=${this.size} style="all: revert">
          ${innerSvg}${this.generateDots()}
        </svg>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-qrcode': QRCode
  }
}
