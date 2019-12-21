const clone = require('clone')
const Preflight = require('../preflight')
const parseSVGColor = require('./svg-parse-color')

const SVG_COLORS_PROPERTIES = ['fill', 'stroke']

module.exports = (el, colorSpace = 'cmyk') => {
  if (!el.properties) return el

  // Never mutate an object
  el = clone(el, false)

  SVG_COLORS_PROPERTIES.forEach(property => {
    const value = el.properties[property]
    if (value === undefined || value === null) return

    const parsed = parseSVGColor(value)
    // Try to use the defined color if its color space is correct, use the fallback if not
    // BUG
    // TODO: Preflight.warn if no matching color space
    // TODO: Preflight.warn if no color
    if (parsed && parsed.color) {
      el.properties[property] = parsed.color.space.toLowerCase() === colorSpace.toLowerCase()
        ? parsed.color.values
        : (parsed.fallback && parsed.fallback.values)
    }

    // Store parsed value into the element properties for further references
    el.properties['__' + property] = parsed
  })

  return el
}
