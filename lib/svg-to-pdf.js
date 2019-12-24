const fs = require('fs-extra')
const tmp = require('tmp')
const PDFDocument = require('pdfkit')
const SVG = require('svg-parser')
const pckg = require('../package.json')

const Preflight = require('./preflight')
const Renderer = require('./pdfkit-renderer')

const parseDimensions = require('./svg/parse-dimensions')
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
  colorSpace = colorSpace.toLowerCase()
  userUnit = userUnit.toLowerCase()

  if (!AVAILABLE_COLOR_SPACES.includes(colorSpace)) {
    throw new Error(`Unknown color space '${colorSpace}'. Valid values are [${AVAILABLE_COLOR_SPACES}]`)
  }

  const svg = SVG.parse(svgString)

  const { width, height } = parseDimensions(svgString, userUnit)
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

  Renderer.init(doc, { colorSpace, userUnit, bleed })

  doc.pipe(fs.createWriteStream(docPath))

  doc.save()
  doc.translate(bleed, bleed)
  Renderer.renderAll(svg)
  doc.restore()

  if (bleed) {
    doc.save()
    marks.colors && Renderer.mark('colors')
    marks.crop && Renderer.mark('crop')
    marks.registration && Renderer.mark('registration')
    doc.restore()
  }

  doc.end()

  return {
    docPath,
    warnings: Preflight.warnings
  }
}
