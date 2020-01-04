const base64mime = require('base64mime')
const filesReport = require('./files-report')

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
  },

  get files () { return filesReport.run() },
  registerImage: (src, properties, isBase64 = false) => {
    if (!src) {
      // NOTE: internal errors shouldn't be thrown in production environment
      if (process.env !== 'production') {
        throw new Error('Cannot register image in Preflight because source is empty')
      }
      return
    }

    isBase64
      ? filesReport.queueMessage(`${base64mime(src) || 'no-MIME'};base64`)
      : filesReport.queue(src, properties)
  }
}

Object.keys(TYPES).forEach(type => {
  module.exports[type] = TYPES[type]
})
