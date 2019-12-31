const Preflight = require('../preflight')
const clone = require('clone')
const parseSVGLength = require('./parse-length')
const pt = require('../utils/convert-to-pdf-point')

// SEE: https://www.w3.org/TR/SVG11/coords.html#Units
const SVG_LENGTH_PROPERTIES = {
  'x': 'actual-width',
  'x1': 'actual-width',
  'x2': 'actual-width',
  'y': 'actual-height',
  'y1': 'actual-height',
  'y2': 'actual-height',
  'cx': 'actual-width',
  'cy': 'actual-height',
  'r': undefined,
  'rx': 'actual-width',
  'ry': 'actual-height',
  'width': 'actual-width',
  'height': 'actual-height',
  'stroke-width': undefined,
  'font-size': undefined,
  'letter-spacing': 'unsupported',
  'word-spacing': 'unsupported'
}

const percentToPt = (value, { property, viewport, userUnit }) => {
  if (!viewport) throw new Error('could not determine viewport')

  switch (SVG_LENGTH_PROPERTIES[property]) {
    case 'unsupported':
      throw new Error(`${property} percent unit is not supported`)
    case 'actual-width':
      value = (value / 100) * viewport.viewBox.width.pt
      break
    case 'actual-height':
      value = (value / 100) * viewport.viewBox.height.pt
      break
    default:
      value = (value / 100) * Math.sqrt((viewport.viewBox.width.pt ** 2) + (viewport.viewBox.height.pt ** 2)) / Math.sqrt(2)
  }

  return value
}

module.exports = (el, { viewport, userUnit }) => {
  if (!el.properties) return el

  // Never mutate an object
  el = clone(el, true)

  Object.keys(SVG_LENGTH_PROPERTIES).forEach(property => {
    const value = el.properties[property]
    if (value === undefined || value === null) return

    const parsed = parseSVGLength(value, userUnit)
    if (!parsed) {
      el.properties[property] = null
      Preflight.warn(`${property}=${value}`, Preflight.CANNOT_PARSE)
      return
    }

    // Store parsed value into the element properties for further references
    el.properties['__' + property] = parsed

    if (parsed.unit === '%') {
      try {
        el.properties[property] = percentToPt(parsed.value, { property, viewport, userUnit })
      } catch (error) {
        Preflight.warn(error.message, Preflight.CANNOT_RESOLVE)
        el.properties[property] = null
      }
      return
    }

    el.properties[property] = parsed.pt
  })

  return el
}
