const pt = require('./convert-to-pdf-point')

module.exports = length => {
  const parts = /([0-9.]+)([a-z]*)/.exec(length)
  if (!parts) return

  const value = parseFloat(parts[1])
  const unit = parts[2] || 'px'
  return {
    value,
    unit,
    pt: pt(value, unit)
  }
}
