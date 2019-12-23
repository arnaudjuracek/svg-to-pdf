const clone = require('clone')
const Preflight = require('../preflight')
const parseSVGColor = require('./svg-parse-color')

const SVG_COLORS_PROPERTIES = [
  'fill',
  'stroke'
]

module.exports = (el, colorSpace = 'cmyk') => {
  if (!el.properties) return el

  // Never mutate an object
  el = clone(el, false)

  SVG_COLORS_PROPERTIES.forEach(property => {
    const value = el.properties[property]
    if (value === undefined || value === null || value === 'none') return

    const parsed = parseSVGColor(value)
    if (!parsed || !parsed.color) {
      el.properties[property] = null
      Preflight.warn(`${property}=${value}`, Preflight.CANNOT_PARSE_COLOR)
      return
    }

    // Store parsed value into the element for further references
    el.properties['__' + property] = parsed

    // Handle colorspace mismatch
    if (parsed.color.space !== colorSpace) {
      el.properties[property] = null
      Preflight.warn(`${property}=${value}`, Preflight.COLORSPACE_MISMATCH)
      // ???: determine if fallback can be used when no matching color space
      // el.properties[property] = (parsed.fallback && parsed.fallback.values)
      return
    }

    el.properties[property] = parsed.color.values
  })

  return el
}
