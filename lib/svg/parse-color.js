const parse = require('color-parse')

module.exports = value => {
  if (!value) return
  if (typeof value !== 'string') {
    throw new TypeError('parse-svg-color: expected type of String for SVG color value')
  }

  // Minor value cleanup so that it is easier to parse :
  // - remove spaces before and after
  // - remove spaces after comma
  // - remove duplicate spaces
  value = value
    .trim()
    .replace(/\s*,\s*/g, ',')
    .replace(/\s\s+/g, ' ')

  // NOTE: `color-parse` does not parse `device-cmyk()` but `cmyk()` pattern
  const parts = value.split(' ').map(part => parse(part.replace(/device-cmyk/gi, 'cmyk')))

  /**
   * NOTE: W3C SVG Color 1.2 defines color value has follow:
   * <color> |
   * fallback <icccolor> |
   * fallback <cielabcolor> |
   * fallback <iccnamedcolor> |
   * fallback <devicecolor>
   * SEE https://www.w3.org/TR/SVGColor12/#device
  */
  let color = (parts[1] || parts[0])
  let fallback = parts[1] ? parts[0] : undefined

  // NOTE: W3C SVG Color 1.2 defines device-cmyk values as 0 to 1 value, but
  // PDFKit handle CMYK values between 0 and 100%
  ;[color, fallback] = [color, fallback].map(c => {
    if (c && c.space === 'cmyk') c.values = c.values.map(v => v * 100)
    return c
  })

  return {
    value,
    color: color.space ? color : undefined,
    fallback,
    RGB: [color, fallback].find(c => c && c.space === 'rgb'),
    CMYK: [color, fallback].find(c => c && c.space === 'cmyk')
  }
}
