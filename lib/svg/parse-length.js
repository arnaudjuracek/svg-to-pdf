const Preflight = require('../preflight')
const pt = require('../utils/convert-to-pdf-point')

module.exports = (length, userUnit = 'px') => {
  const parts = /([-+]?[0-9.]+)([a-z%]*)/.exec(length)
  if (!parts) return

  const value = parseFloat(parts[1])
  let unit = parts[2] || userUnit

  if (unit === '%') {
    Preflight.warn(length, Preflight.UNSUPPORTED_UNIT)
    unit = userUnit
  }

  return {
    value,
    unit,
    pt: pt(value, unit)
  }
}
