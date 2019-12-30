const parseLength = require('./parse-length')

module.exports = (viewbox, userUnit = 'px') => {
  const bounds = viewbox.split(' ')
  return {
    minx: parseLength(bounds[0], userUnit),
    miny: parseLength(bounds[1], userUnit),
    height: parseLength(bounds[3], userUnit),
    width: parseLength(bounds[2], userUnit)
  }
}
