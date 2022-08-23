import { LitElement, html, svg, TemplateResult } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import QRCodeUtil from 'qrcode'
import styles from './styles'
import { global } from '../../utils/Theme'

const CONNECTING_ERROR_MARGIN = 0.1

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

  private dotsCloseToEachOther(cy: number, otherCy: number, cellSize: number) {
    if (cy === otherCy) return false
    const diff = cy - otherCy < 0 ? otherCy - cy : cy - otherCy
    return diff <= cellSize + CONNECTING_ERROR_MARGIN
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
    let circles: [number, number][] = []
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
              let cx = i * cellSize + cellSize / 2
              let cy = j * cellSize + cellSize / 2
              circles.push([cx, cy])
            }
          }
        }
      })
    })

    // cx to multiple cys
    let circlesToConnect: Record<number, number[]> = {}

    circles.forEach(([cx, cy]) => {
      if (!circlesToConnect[cx]) {
        circlesToConnect[cx] = [cy]
      } else {
        circlesToConnect[cx].push(cy)
      }

      dots.push(
        svg`
          <circle
            cx=${cx}
            cy=${cy}
            fill="black"
            r=${cellSize / 3} 
          />
        `
      )
    })

    Object.entries(circlesToConnect)
      .filter(([_, cys]) => cys.length > 1)
      .map(([cx, cys]) => {
        const newCys = cys.filter(cy =>
          cys.some(otherCy => {
            return this.dotsCloseToEachOther(cy, otherCy, cellSize)
          })
        )
        return [Number(cx), newCys] as [number, number[]]
      })
      .filter(([_, cys]) => cys.length > 0)
      .map(([cx, cys]) => {
        cys.sort((a, b) => (a < b ? -1 : 1))
        let groups: number[][] = []

        for (const cy of cys) {
          const group = groups.find(group => {
            return group.some(otherCy => this.dotsCloseToEachOther(cy, otherCy, cellSize))
          })
          if (group) {
            group.push(cy)
          } else {
            groups.push([cy])
          }
        }

        return [cx, groups.map(group => [group[0], group[group.length - 1]])] as [
          number,
          number[][]
        ]
      })
      .forEach(([cx, groups]) => {
        groups.forEach(group => {
          group.forEach(cy => {
            dots.push(
              svg`
                <circle
                  cx=${cx}
                  cy=${cy}
                  fill="red"
                  r=${cellSize / 3} 
                />
              `
            )
          })
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
