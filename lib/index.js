const fs = require('fs-extra')
const PDFDocument = require('pdfkit')
const { parse } = require('svg-parser')
const { inspect } = require('util')

const svgPath = require('svgpath')

const isProduction = require('./utils/env-is-production')
const resolveColorProperties = require('./utils/svg-resolve-color')
const svgSize = require('./utils/svg-parse-size')
const pt = require('./utils/convert-to-pdf-point')

const SVG_PROPERTY_TO_PDF_KIT_METHOD = {
  fill: 'fillColor',
  stroke: 'strokeColor',
  'stroke-width': 'lineWidth'
  // TODO: implement http://pdfkit.org/docs/vector.html#fill_and_stroke_styles
}

module.exports = (svgString, {
  colorSpace = 'cmyk', // Should be either 'rgb' or 'cmyk'
  userUnit = 'px', // TODO: implementation
  title = '',
  subject = '',
  author = '',
  producer = 'chevalvert/svg-to-pdf',
  creator = 'chevalvert/svg-to-pdf',
  keywords = '',
  userPassword = undefined,
  ownerPassword = undefined,
  permissions = undefined
} = {}) => {
  const svg = parse(svgString)

  const { width, height } = svgSize.calculate(svgString)
  console.log({ width, height })

  const warnings = []
  const doc = new PDFDocument({
    margin: 0,
    // WIP
    size: pt([210, 297], 'mm'),
    info: {
      'Title': title,
      'Author': author,
      'Subject': subject,
      'Keywords': keywords,
      'Producer': producer,
      'Creator': creator
    },
    userPassword,
    ownerPassword,
    permissions
  })

  // TODO: tmp/file
  doc.pipe(fs.createWriteStream('/Users/RNO/Desktop/output.pdf'))

  render(svg)

  // TODO: printer's marks:
  // marks.crop && renderCropMarks()
  // marks.bleed && renderBleedMarks()
  // marks.registration && renderRegistrationMarks()
  // marks.colors && renderColorsMarks()

  doc.end()

  return { warnings }

  function render (el) {
    if (!isProduction) console.log(inspect(el, { depth: 2, colors: true }), '\n')

    el = resolveColorProperties(el, colorSpace)
    if (el.tagName === 'path') renderPath(el)
    if (el.children) el.children.forEach(render)
  }

  function renderPath (path) {
    doc.save()
    applyStyle(path.properties)

    // TODO: scale aspect
    const d = svgPath(path.properties.d)
      .scale(3)
      .translate(100, 200)
      .toString()

    doc.path(d).fillAndStroke()
    doc.restore()
  }

  function applyStyle (properties) {
    Object.entries(properties).forEach(([property, value]) => {
      const method = SVG_PROPERTY_TO_PDF_KIT_METHOD[property]
      if (typeof doc[method] === 'function') doc[method](value)
    })
  }
}
