const convert = require('convert-length')

module.exports = (length, unit = 'mm') => {
  return Array.isArray(length)
    ? length.map(v => convert(v, unit, 'pt'))
    : convert(length, unit, 'pt')
}
