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
    // NOTE: some viewports can have x and y attributes
    position: [
      parseLength(element.properties.x || 0, userUnit).pt,
      parseLength(element.properties.y || 0, userUnit).pt
    ],
    scale: width !== undefined && height !== undefined
      ? [width.pt / viewBox.width.pt, height.pt / viewBox.height.pt]
      : [1, 1],
    offset: [-viewBox.minx.pt, -viewBox.miny.pt]
  }
}
