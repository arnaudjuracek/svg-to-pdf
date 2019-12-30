const clone = require('clone')

const SVG_INERHITABLE_PROPERTIES = [
  'clip-path',
  'fill',
  'fill-opacity',
  'fill-rule',
  'opacity',
  'stroke',
  'stroke-opacity',
  'stroke-width',
  'transform'
]

module.exports = (el, userUnit = 'px') => {
  if (!el.properties) return el
  if (!el.properties.inherited) return el

  // Never mutate an object
  el = clone(el, true)

  SVG_INERHITABLE_PROPERTIES.forEach(property => {
    const value = el.properties.inherited[property]
    if (value === undefined || value === null) return

    el.properties[property] = value
  })

  return el
}
