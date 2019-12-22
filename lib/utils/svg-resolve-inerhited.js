const clone = require('clone')

const SVG_INERHITABLE_PROPERTIES = [
  'fill',
  'stroke',
  'stroke-width'
]

module.exports = (el, userUnit = 'px') => {
  if (!el.properties) return el
  if (!el.properties.inerhited) return el

  // Never mutate an object
  el = clone(el, false)

  SVG_INERHITABLE_PROPERTIES.forEach(property => {
    const value = el.properties.inerhited[property]
    if (value === undefined || value === null) return

    el.properties[property] = value
  })

  return el
}
