const clone = require('clone')
const Preflight = require('../preflight')
const parseSVGColor = require('./parse-color')

const SVG_COLORS_PROPERTIES = [
  'fill',
  'stroke'
]

const SVG_DEFAULT_FILL = {
  cmyk: [0, 0, 0, 1],
  rgb: [0, 0, 0]
}

module.exports = (el, colorSpace = 'cmyk') => {
  if (!el.properties) return el

  // Never mutate an object
  el = clone(el, true)

  SVG_COLORS_PROPERTIES.forEach(property => {
    const value = el.properties[property]
    if (value === 'none' || value === 'transparent') {
      el.properties[property] = null
      return
    }

    // NOTE: default fill property should be black, but not on <clipPath> children
    if (value === undefined || value === null) {
      el.properties[property] = property === 'fill' && !el.hasAncestor('clipPath')
        ? SVG_DEFAULT_FILL[colorSpace]
        : null
      return
    }

    const parsed = parseSVGColor(value)
    if (!parsed || !parsed.color) {
      el.properties[property] = null
      Preflight.warn(`${property}=${value}`, Preflight.CANNOT_PARSE)
      return
    }

    // Store parsed value into the element for further references
    el.properties['__' + property] = parsed

    // Handle colorspace mismatch
    let color = parsed.color
    if (color.space !== colorSpace) color = parsed.fallback
    if (!color || color.space !== colorSpace) {
      el.properties[property] = null
      Preflight.warn(`${property}=${value}`, Preflight.COLORSPACE_MISMATCH)
      return
    }

    el.properties[property] = color.values
  })

  return el
}
