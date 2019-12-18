const parseSVGColor = require('./parse-svg-color')

const SVG_COLORS_PROPERTIES = ['fill', 'stroke']

module.exports = (element, colorSpace = 'cmyk') => {
  const props = {}
  SVG_COLORS_PROPERTIES.forEach(property => {
    if (!element.properties || !element.properties.hasOwnProperty(property)) return

    // NOTE: storing raw and parsed values in additionnal properties for debug purpose
    props[property + '_raw'] = element.properties[property]
    const parsed = parseSVGColor(element.properties[property])
    props[property + '_parsed'] = parsed

    // Try to use the defined color if its color space is correct, use the fallback if not
    if (parsed && parsed.color) {
      props[property] = parsed.color.space.toLowerCase() === colorSpace.toLowerCase()
        ? parsed.color.values
        : (parsed.fallback && parsed.fallback.values)
    }
  })

  // Do not mutate passed element, but return a new one instead
  return Object.assign({}, element, {
    properties: Object.assign({}, element.properties, props)
  })
}
