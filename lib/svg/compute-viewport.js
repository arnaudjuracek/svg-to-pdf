const parseLength = require('./parse-length')
const parseViewBox = require('./parse-viewBox')

module.exports = (element, userUnit = 'px') => {
  const viewBoxProperty = element.properties.viewBox || `0 0 ${element.properties.width} ${element.properties.height}`
  const viewBox = parseViewBox(viewBoxProperty, userUnit)

  const width = parseLength(element.properties.width, userUnit) || viewBox.width
  const height = parseLength(element.properties.height, userUnit) || viewBox.height

  return {
    viewBox,
    width,
    height,
    scale: [width.pt / viewBox.width.pt, height.pt / viewBox.height.pt],
    offset: [-viewBox.minx.pt, -viewBox.miny.pt]
  }
}
