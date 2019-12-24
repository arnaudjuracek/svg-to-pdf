const TYPES = {
  NO_RENDER: 'PDF rendering for the element is not implemented',
  NO_BLEED_NO_MARK: 'No bleed area specified, skipping mark',
  CANNOT_PARSE_COLOR: 'Cannot parse color value',
  COLORSPACE_MISMATCH: 'Color space does not match user definition',
  CANNOT_LOAD_FILE: 'File cannnot be loaded',
  DEPRECATED_FEATURE: 'SVG feature is deprecated'
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
