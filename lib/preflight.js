const TYPES = {
  NO_RENDER: Symbol('PDF rendering for the element is not implemented'),
  CANNOT_PARSE_COLOR: Symbol('Cannot parse color value'),
  COLORSPACE_MISMATCH: Symbol('Color space does not match user definition')
}

const warnings = {}

module.exports = {
  get warnings () { return warnings },
  warn: (message, type) => {
    if (!warnings[type]) warnings[type] = []
    warnings[type].push(message)
  }
}

Object.keys(TYPES).forEach(type => {
  module.exports[type] = TYPES[type]
})
