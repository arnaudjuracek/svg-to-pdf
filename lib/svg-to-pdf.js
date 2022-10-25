const fs = require('fs-extra')
const tmp = require('tmp')
const PDFDocument = require('pdfkit')
const pckg = require('../package.json')

const Preflight = require('./preflight')
const Renderer = require('./pdfkit-renderer')

const parseSVG = require('./svg/parse-svg')
const parseLength = require('./svg/parse-length')
const computeViewport = require('./svg/compute-viewport')

const AVAILABLE_COLOR_SPACES = ['rgb', 'cmyk']
const creator = `arnaudjuracek/${pckg.name}@${pckg.version}`

module.exports = (svgString, {
  colorSpace = 'rgb',
  userUnit = 'px',

  bleed = 0,
  marks = {
    // NOTE: avoid throwing Preflight warning when bleed value is intentionnaly
    // set to 0: throw only if marks are intentionnaly set to true with a null
    // bleed value
    colors: !!bleed,
    crop: !!bleed,
    registration: !!bleed
  },

  createFilesReport = true,

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
} = {}) => new Promise(resolve => {
  if (!svgString || !svgString.length) {
    throw new Error(`SVG string is empty or undefined`)
  }

  colorSpace = colorSpace.toLowerCase()
  userUnit = userUnit.toLowerCase()

  if (!AVAILABLE_COLOR_SPACES.includes(colorSpace)) {
    throw new Error(`Unknown color space '${colorSpace}'. Valid values are [${AVAILABLE_COLOR_SPACES}]`)
  }

  Preflight.clear()

  const svg = parseSVG(svgString)
  const svgElement = svg.children[0]
  if (!svgElement || !svgElement.properties) {
    throw new Error(`Cannot find SVG first child, SVG may be empty`)
  }

  const viewport = computeViewport(svgElement, userUnit)
  if (!viewport.width || !viewport.height) {
    throw new Error(`Could not determine SVG viewport size, make sure at least the 'viewBox' attribute, or the 'width' and 'height' attributes are present on the root element`)
  }

  bleed = parseLength(bleed || 0, userUnit).pt

  const doc = new PDFDocument({
    margin: 0,
    size: [
      viewport.width.pt + bleed * 2,
      viewport.height.pt + bleed * 2
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

  const file = fs.createWriteStream(docPath, { autoDestroy: true })
  file.on('error', err => { throw err })
  file.on('finish', done)

  doc.pipe(file)

  doc.save()
  doc.translate(bleed, bleed)
  Renderer.renderAll(svg, { viewport })
  doc.restore()

  doc.save()
  marks.colors && Renderer.mark('colors')
  marks.crop && Renderer.mark('crop')
  marks.registration && Renderer.mark('registration')
  doc.restore()

  doc.end()

  async function done () {
    resolve({
      docPath,
      warnings: Preflight.warnings,
      // NOTE: files analysis is opt-out because it can be perf heavy
      files: createFilesReport ? await Preflight.files : null
    })
  }
})
