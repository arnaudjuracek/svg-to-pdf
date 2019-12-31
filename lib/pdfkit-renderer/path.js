const pt = require('../utils/convert-to-pdf-point')

module.exports = () => (el, { doc, userUnit }) => {
  // NOTE: as `d` path attribute coordinates are always unitless, we have to
  // make sure that they are converted to point unit from the specified
  // userUnit by scaling the whole path
  doc.scale(pt(1, userUnit))
  doc.path(el.properties.d)
}
