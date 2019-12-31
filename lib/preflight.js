const TYPES = {
  SKIPPED_RENDER: 'PDF rendering for the element has been skipped',

  CANNOT_PARSE: 'Cannot parse property',
  CANNOT_RESOLVE: 'Cannot resolve property',

  COLORSPACE_MISMATCH: 'Color space does not match user definition',
  CANNOT_LOAD_FILE: 'File cannnot be loaded',

  UNSUPPORTED_FEATURE: 'SVG feature is not supported',
  UNSUPPORTED_UNIT: 'Unit is unknown or not supported, assuming user unit instead'
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
