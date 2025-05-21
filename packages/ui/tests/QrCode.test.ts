import { describe, expect, it } from 'vitest'

import { QrCodeUtil } from '../src/utils/QrCode.js'

describe('QrCodeUtil', () => {
  const TEST_URI = 'https://example.com'
  const TEST_SIZE = 300
  const TEST_LOGO_SIZE = 75

  it('should generate QR code with default settings', () => {
    const dots = QrCodeUtil.generate({
      uri: TEST_URI,
      size: TEST_SIZE,
      logoSize: TEST_LOGO_SIZE
    })

    expect(Array.isArray(dots)).toBe(true)
    expect(dots.length).toBeGreaterThan(0)

    dots.forEach(dot => {
      expect(dot).toHaveProperty('strings')
      expect(dot).toHaveProperty('values')
      expect(Array.isArray(dot.strings)).toBe(true)
    })

    const svgStrings = dots.map(dot => dot.strings.join(''))

    const rectCount = svgStrings.filter(str => str.includes('<rect')).length
    expect(rectCount).toBeGreaterThan(0)

    const circleCount = svgStrings.filter(str => str.includes('<circle')).length
    expect(circleCount).toBeGreaterThan(0)

    const lineCount = svgStrings.filter(str => str.includes('<line')).length
    expect(lineCount).toBeGreaterThan(0)
  })

  it('should generate QR code with custom color', () => {
    const customColor = '#FF0000'
    const dots = QrCodeUtil.generate({
      uri: TEST_URI,
      size: TEST_SIZE,
      logoSize: TEST_LOGO_SIZE,
      dotColor: customColor
    })

    expect(Array.isArray(dots)).toBe(true)

    const hasCustomColor = dots.some(
      dot => dot.values && Array.isArray(dot.values) && dot.values.includes(customColor)
    )

    expect(hasCustomColor).toBe(true)
  })

  it('should generate QR code with no logo area when logoSize is 0', () => {
    const dotsWithLogo = QrCodeUtil.generate({
      uri: TEST_URI,
      size: TEST_SIZE,
      logoSize: TEST_LOGO_SIZE
    })

    const dotsNoLogo = QrCodeUtil.generate({
      uri: TEST_URI,
      size: TEST_SIZE,
      logoSize: 0
    })

    expect(dotsNoLogo.length).toBeGreaterThan(dotsWithLogo.length)
  })

  it('should generate different QR codes for different URIs', () => {
    const dots1 = QrCodeUtil.generate({
      uri: 'https://example.com/1',
      size: TEST_SIZE,
      logoSize: TEST_LOGO_SIZE
    })

    const dots2 = QrCodeUtil.generate({
      uri: 'https://example.com/2',
      size: TEST_SIZE,
      logoSize: TEST_LOGO_SIZE
    })

    const svgStrings1 = dots1.map(dot => dot.strings.join('')).join('')
    const svgStrings2 = dots2.map(dot => dot.strings.join('')).join('')

    expect(svgStrings1).not.toEqual(svgStrings2)
  })

  it('should generate scaled QR code based on size parameter', () => {
    const smallSize = 100
    const largeSize = 500

    const smallDots = QrCodeUtil.generate({
      uri: TEST_URI,
      size: smallSize,
      logoSize: TEST_LOGO_SIZE
    })

    const largeDots = QrCodeUtil.generate({
      uri: TEST_URI,
      size: largeSize,
      logoSize: TEST_LOGO_SIZE
    })

    const smallSvgString = smallDots.map(dot => dot.strings.join('')).join('')
    const largeSvgString = largeDots.map(dot => dot.strings.join('')).join('')

    const smallWidthMatch = smallSvgString.match(/width=(\d+)/)
    const largeWidthMatch = largeSvgString.match(/width=(\d+)/)

    if (smallWidthMatch && largeWidthMatch && smallWidthMatch[1] && largeWidthMatch[1]) {
      const smallWidth = parseInt(smallWidthMatch[1], 10)
      const largeWidth = parseInt(largeWidthMatch[1], 10)
      expect(largeWidth).toBeGreaterThan(smallWidth)
    } else {
      expect(largeDots.length).toBeGreaterThanOrEqual(smallDots.length)
    }
  })
})
