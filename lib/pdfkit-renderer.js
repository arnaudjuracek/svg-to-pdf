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
    if (value === undefined || value === null) return

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
  },

  circle: (doc, el, { colorSpace, userUnit }) => {
    render(doc, el, { colorSpace, userUnit }, el => {
      doc.circle(el.properties.cx, el.properties.cy, el.properties.r)
    })
  },

  ellipse: (doc, el, { colorSpace, userUnit }) => {
    render(doc, el, { colorSpace, userUnit }, el => {
      doc.ellipse(el.properties.cx, el.properties.cy, el.properties.rx, el.properties.ry)
    })
  },

  registrationMarks: (doc, { colorSpace, bleed }) => {
    if (!bleed) return

    const black = colorSpace === 'cmyk' ? [100, 100, 100, 100] : [0, 0, 0]
    const paper = colorSpace === 'cmyk' ? [0, 0, 0, 0] : [255, 255, 255]

    // NOTE: for simplicity's sake, length are expressed in point
    const w = 0.5
    const c = bleed / 2
    const r1 = bleed / 4
    const r2 = r1 * 0.6
    const r3 = r1 * 1.2

    const { width, height } = doc.page

    mark(width / 2, c)
    mark(width - c, height / 2)
    mark(width / 2, height - c)
    mark(c, doc.page.height / 2)

    function mark (x, y) {
      doc
        .lineWidth(w)
        .circle(x, y, r1 - w * 2)
        .moveTo(x - r3, y)
        .lineTo(x + r3, y)
        .moveTo(x, y - r3)
        .lineTo(x, y + r3)
        .stroke(black)
        .circle(x, y, r2)
        .fill(black)
        .moveTo(x - r2, y)
        .lineTo(x + r2, y)
        .moveTo(x, y - r2)
        .lineTo(x, y + r2)
        .stroke(paper)
    }
  },

  colorsMarks: (doc, { colorSpace, bleed }) => {
    if (!bleed) return

    // ???: colors marks for rgb color space
    if (colorSpace !== 'cmyk') return

    // ???: use all colors applied to elements
    const colors = [
      [100, 0, 0, 0],
      [0, 100, 0, 0],
      [0, 0, 100, 0],
      [0, 0, 0, 100]
    ]

    // NOTE: for simplicity's sake, length are expressed in point
    const w = 0.5
    const size = bleed * 0.5 - w * 2
    let x = bleed + size
    const y = (bleed - size) / 2

    colors.forEach((color) => {
      doc
        .lineWidth(w)
        .rect(x, y, size, size)
        .fillAndStroke(color, [65, 65, 65, 65])
      x += size
    })
  },

  cropMarks: (doc, { colorSpace, bleed }) => {
    if (!bleed) return

    const black = colorSpace === 'cmyk' ? [100, 100, 100, 100] : [0, 0, 0]

    const { width, height } = doc.page
    const w = 0.5
    const m = bleed / 4

    doc
      .lineWidth(w)
      .moveTo(0, bleed).lineTo(bleed - m, bleed)
      .moveTo(bleed, 0).lineTo(bleed, bleed - m)
      .moveTo(width, bleed).lineTo(width - (bleed - m), bleed)
      .moveTo(width - bleed, 0).lineTo(width - bleed, bleed - m)
      .moveTo(width, height - bleed).lineTo(width - (bleed - m), height - bleed)
      .moveTo(width - bleed, height).lineTo(width - bleed, height - (bleed - m))
      .moveTo(0, height - bleed).lineTo(bleed - m, height - bleed)
      .moveTo(bleed, height).lineTo(bleed, height - (bleed - m))
      .stroke(black)
  }
}
