const clone = require('clone')
const parseSVGLength = require('./svg-parse-length')

const SVG_LENGTH_PROPERTIES = [
  'x',
  'y',
  'cx',
  'cy',
  'r',
  'rx',
  'ry',
  'width',
  'height',
  'stroke-width'
]

module.exports = (el, userUnit = 'px') => {
  if (!el.properties) return el

  // Never mutate an object
  el = clone(el, false)

  SVG_LENGTH_PROPERTIES.forEach(property => {
    const value = el.properties[property]
    if (value === undefined || value === null) return

    const parsed = parseSVGLength(value, userUnit)
    if (parsed) el.properties[property] = parsed.pt

    // Store parsed value into the element properties for further references
    el.properties['__' + property] = parsed
  })

  return el
}
