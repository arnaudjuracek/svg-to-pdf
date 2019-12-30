const fs = require('fs-extra')
const tmp = require('tmp')
const PDFDocument = require('pdfkit')
const pckg = require('../package.json')

const Preflight = require('./preflight')
const Renderer = require('./pdfkit-renderer')

const parseSVG = require('./svg/parse-svg')
const parseLength = require('./svg/parse-length')
const parseViewBox = require('./svg/parse-viewBox')
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
  rootPath = process.cwd(),
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

  const svg = parseSVG(svgString)
  const viewport = svg.children[0]
  if (!viewport || !viewport.properties) {
    throw new Error(`Cannot find SVG first child, SVG may be empty`)
  }

  const viewBoxProperty = viewport.properties.viewBox || `0 0 ${viewport.properties.width} ${viewport.properties.height}`
  const viewBox = parseViewBox(viewBoxProperty, userUnit)
  const width = parseLength(viewport.properties.width, userUnit) || viewBox.width
  const height = parseLength(viewport.properties.height, userUnit) || viewBox.height

  if (!width || !height) {
    throw new Error(`Could not determine SVG viewport size, make sure at least the 'viewBox' attribute, or the 'width' and 'height' attributes are present on the root element`)
  }

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

  Renderer.init(doc, { colorSpace, userUnit, bleed, rootPath })

  doc.pipe(fs.createWriteStream(docPath))

  doc.save()
  doc.translate(bleed, bleed)

  doc.save()
  doc.scale(width.pt / viewBox.width.pt, height.pt / viewBox.height.pt)
  doc.translate(-viewBox.minx.pt, -viewBox.miny.pt)

  Renderer.renderAll(svg)

  doc.restore()

  doc.restore()

  doc.save()
  marks.colors && Renderer.mark('colors')
  marks.crop && Renderer.mark('crop')
  marks.registration && Renderer.mark('registration')
  doc.restore()

  doc.end()

  return {
    docPath,
    warnings: Preflight.warnings
  }
}
