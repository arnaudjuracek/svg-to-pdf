const parsePercentage = require('./parse-percentage')

const SVG_PERCENTAGE_PROPERTIES = [
  'opacity',
  'fill-opacity',
  'stroke-opacity'
]

module.exports = el => {
  if (!el.properties) return el

  SVG_PERCENTAGE_PROPERTIES.forEach(property => {
    const value = el.properties[property]
    if (value === undefined || value === null) return

    el.properties[property] = parsePercentage(value) || value
  })

  return el
}
