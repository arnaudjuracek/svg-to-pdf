const fs = require('fs-extra')
const tmp = require('tmp')
const PDFDocument = require('pdfkit')
const SVG = require('svg-parser')
const pckg = require('../package.json')

const Preflight = require('./preflight')
const Renderer = require('./pdfkit-renderer')

const parseSVGDimensions = require('./utils/svg-parse-dimensions')
const pt = require('./utils/convert-to-pdf-point')

const AVAILABLE_COLOR_SPACES = ['rgb', 'cmyk']
const creator = `chevalvert/${pckg.name}@${pckg.version}`

module.exports = (svgString, {
  colorSpace = 'cmyk',
  userUnit = 'mm',
  bleed = 10,

  marks = {
    colors: true,
    crop: true,
    registration: true
  },

  docPath = tmp.tmpNameSync({ postfix: '.pdf' }),
  pdfVersion = 1.3,
  userPassword = undefined,
  ownerPassword = undefined,
  permissions = undefined,
  title = '',
  subject = '',
  author = '',
  producer = creator,
  keywords = ''
} = {}) => {
  if (!AVAILABLE_COLOR_SPACES.includes(colorSpace)) {
    throw new Error(`Unknown color space '${colorSpace}'. Valid values are [${AVAILABLE_COLOR_SPACES}]`)
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
    permissions,
    pdfVersion
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
      case 'line':
      // TODO: case 'polyline':
      // TODO: case 'polygon':
        Renderer[el.tagName](doc, el, { colorSpace, userUnit })
        break

      default: Preflight.warn(`<${el.tagName}>`, Preflight.NO_RENDER)
    }

    if (el.children) el.children.forEach(render)
  }
}
