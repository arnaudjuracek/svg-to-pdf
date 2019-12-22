const resolveColorProperties = require('./utils/svg-resolve-color')
const resolveLengthProperties = require('./utils/svg-resolve-length')
const pt = require('./utils/convert-to-pdf-point')

const SVG_PROPERTY_TO_PDF_KIT_METHOD = {
  fill: 'fillColor',
  stroke: 'strokeColor',
  'stroke-width': 'lineWidth'
  // TODO: implement http://pdfkit.org/docs/vector.html#fill_and_stroke_styles
}

function applyStyle (doc, properties) {
  Object.entries(properties).forEach(([property, value]) => {
    const method = SVG_PROPERTY_TO_PDF_KIT_METHOD[property]
    if (typeof doc[method] === 'function') doc[method](value)
  })
}

function render (doc, el, { colorSpace, userUnit }, drawCallback) {
  el = resolveColorProperties(el, colorSpace)
  el = resolveLengthProperties(el, userUnit)

  doc.save()
  applyStyle(doc, el.properties)

  drawCallback(el)

  if (el.properties.stroke && el.properties.fill) doc.fillAndStroke()
  else if (!el.properties.stroke) doc.fill()
  else doc.stroke()

  doc.restore()
}

module.exports = {
  path: (doc, el, { colorSpace, userUnit }) => {
    render(doc, el, { colorSpace, userUnit }, el => {
      // NOTE: as `d` path attribute coordinates are always unitless, we have to
      // make sure that they are converted to point unit from the specified
      // userUnit by scaling the whole path
      doc.scale(pt(1, userUnit))
      doc.path(el.properties.d)
    })
  },

  rect: (doc, el, { colorSpace, userUnit }) => {
    render(doc, el, { colorSpace, userUnit }, el => {
      doc.rect(el.properties.x, el.properties.y, el.properties.width, el.properties.height)
    })
  }
}
