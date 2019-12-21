const fs = require('fs-extra')
const tmp = require('tmp')
const PDFDocument = require('pdfkit')
const SVG = require('svg-parser')

const Preflight = require('./preflight')
const Renderer = require('./pdfkit-renderer')

const parseSVGDimensions = require('./utils/svg-parse-dimensions')
const pt = require('./utils/convert-to-pdf-point')

module.exports = (svgString, {
  colorSpace = 'rgb',
  userUnit = 'mm',
  bleed = 10,

  marks = {
    crop: false,
    bleed: false,
    registration: false,
    colors: false
  },

  docPath = tmp.tmpNameSync({ postfix: '.pdf' }),
  userPassword = undefined,
  ownerPassword = undefined,
  permissions = undefined,
  title = '',
  subject = '',
  author = '',
  producer = 'chevalvert/svg-to-pdf',
  creator = 'chevalvert/svg-to-pdf',
  keywords = ''
} = {}) => {
  const svg = SVG.parse(svgString)
  const { width, height } = parseSVGDimensions(svgString, userUnit)

  bleed = pt(bleed, userUnit)

  const doc = new PDFDocument({
    margin: 0,
    size: [
      width.pt + bleed * 2,
      height.pt + bleed * 2
    ],
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

  doc.pipe(fs.createWriteStream(docPath))
  doc.translate(bleed, bleed)

  render(svg)

  // TODO: printer's marks:
  // marks.crop && renderCropMarks()
  // marks.bleed && renderBleedMarks()
  // marks.registration && renderRegistrationMarks()
  // marks.colors && renderColorsMarks()

  doc.end()

  return {
    docPath,
    warnings: Preflight.warnings
  }

  function render (el) {
    switch (el.tagName) {
      case undefined:
      case 'svg':
      case 'g':
        break

      case 'rect': Renderer.rect(doc, el, { colorSpace, userUnit }); break
      case 'path': Renderer.path(doc, el, { colorSpace, userUnit }); break

      default: Preflight.warn(`<${el.tagName}>`, Preflight.NO_RENDER)
    }

    if (el.children) el.children.forEach(render)
  }
}
