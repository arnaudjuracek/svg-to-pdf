const clone = require('clone')

const SVG_REFERENCES_PROPERTIES = [
  'href',
  'xlink:href',
  'clip-path'
]

module.exports = (el, REFS) => {
  if (!el.properties) return el

  // Never mutate an object
  el = clone(el, true)

  SVG_REFERENCES_PROPERTIES.forEach(property => {
    const value = el.properties[property]
    if (value === undefined || value === null) return

    const matches = /(?:url\()?#([A-Za-z0-9_-]+)(?:\))?/.exec(value)
    const id = (matches || [])[1]

    // If no ref object, keep the original value as it may be a base64 encoded
    // dataURI or a reference to an external file
    el.properties[property] = REFS[id] || value

    // Store raw value into the element properties for further references
    el.properties['__' + property] = value
  })

  return el
}
