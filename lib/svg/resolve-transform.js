const parseTransform = require('./parse-transform')

const clone = require('clone')
const Preflight = require('../preflight')

module.exports = (el, userUnit = 'px') => {
  if (!el.properties) return el

  const value = el.properties.transform
  if (!value) return el

  // Never mutate an object
  el = clone(el, false)

  const parsed = parseTransform(value, userUnit)
  if (!parsed) {
    Preflight.warn(`transform=${value}`, Preflight.CANNOT_PARSE_TRANSFORM)
    return el
  }

  // Store parsed value into the element for further references
  el.properties['__transform'] = parsed

  // Assign each transform function to its own properties for easier SVG prop to
  // PDFKit method mapping
  Object.entries(parsed).forEach(([transformFunction, value]) => {
    if (['skewX', 'skewY'].includes(transformFunction)) {
      Preflight.warn(transformFunction, Preflight.UNSUPPORTED_FEATURE)
    }

    switch (transformFunction) {
      case 'translate':
        value = value.map(v => v.pt)
        break
      case 'rotate':
        if (!value[1] || !value[1].origin) break
        value[1].origin = value[1].origin.map(v => v.pt)
        break
    }

    el.properties[transformFunction] = value
  })

  return el
}
