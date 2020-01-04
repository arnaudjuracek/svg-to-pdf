const convert = require('convert-length')

module.exports = (length, unit) => {
  if (!unit || typeof unit !== 'string') {
    throw new Error('A unit must be specified in order to convert to PDF points')
  }

  return Array.isArray(length)
    ? length.map(v => convert(v, unit, 'pt'))
    : convert(length, unit, 'pt')
}
