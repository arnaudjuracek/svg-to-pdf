const fs = require('fs-extra')
const tmp = require('tmp')
const PDFDocument = require('pdfkit')
const SVG = require('svg-parser')

const Preflight = require('./preflight')
const Renderer = require('./pdfkit-renderer')

const parseSVGDimensions = require('./utils/svg-parse-dimensions')
const pt = require('./utils/convert-to-pdf-point')

const COLOR_SPACES = ['rgb', 'cmyk']

module.exports = (svgString, {
  colorSpace = 'cmyk',
  userUnit = 'mm',
  bleed = 5,

  marks = {
    colors: true,
    crop: true,
    registration: true
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
  if (!COLOR_SPACES.includes(colorSpace)) {
    throw new Error(`Unknown color space '${colorSpace}'. Valid values are [${COLOR_SPACES}]`)
  }

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

  doc.save()
  doc.translate(bleed, bleed)
  render(svg)
  doc.restore()

  if (bleed) {
    doc.save()
    marks.colors && Renderer.colorsMarks(doc, { colorSpace, bleed })
    marks.crop && Renderer.cropMarks(doc, { colorSpace, bleed })
    marks.registration && Renderer.registrationMarks(doc, { colorSpace, bleed })
    doc.restore()
  }

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

      case 'path':
      case 'rect':
      case 'circle':
      case 'ellipse':
        Renderer[el.tagName](doc, el, { colorSpace, userUnit })
        break

      default: Preflight.warn(`<${el.tagName}>`, Preflight.NO_RENDER)
    }

    if (el.children) el.children.forEach(render)
  }
}
