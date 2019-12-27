const Preflight = require('./preflight')

const resolveColorProperties = require('./svg/resolve-color')
const resolveInheritedProperties = require('./svg/resolve-inherited')
const resolveLengthProperties = require('./svg/resolve-length')
const resolvePercentageProperties = require('./svg/resolve-percentage')
const resolveTransformProperties = require('./svg/resolve-transform')
const resolveReferencesProperties = require('./svg/resolve-references')

const RENDERS = {
  circle: require('./pdfkit-renderer/circle'),
  ellipse: require('./pdfkit-renderer/ellipse'),
  image: require('./pdfkit-renderer/image'),
  line: require('./pdfkit-renderer/line'),
  path: require('./pdfkit-renderer/path'),
  polygon: require('./pdfkit-renderer/polygon'),
  polyline: require('./pdfkit-renderer/polyline'),
  rect: require('./pdfkit-renderer/rect'),

  mark: {
    colors: require('./pdfkit-renderer/mark/colors'),
    crop: require('./pdfkit-renderer/mark/crop'),
    registration: require('./pdfkit-renderer/mark/registration')
  }
}

// TODO: implement http://pdfkit.org/docs/vector.html#dashed_lines
const SVG_PROPERTY_TO_PDFKIT_METHOD = {
  'fill-opacity': 'fillOpacity',
  fill: 'fillColor',
  matrix: 'transform',
  opacity: 'opacity',
  rotate: 'rotate',
  scale: 'scale',
  'stroke-linecap': 'lineCap',
  'stroke-linejoin': 'lineJoin',
  'stroke-miterlimit': 'miterLimit',
  'stroke-opacity': 'strokeOpacity',
  'stroke-width': 'lineWidth',
  stroke: 'strokeColor',
  translate: 'translate'
}

const SPREADABLE_PDFKIT_METHODS = ['translate', 'rotate', 'scale', 'matrix']

const REFS = {}

let doc
let options

module.exports.init = (_doc, _options) => {
  doc = _doc
  options = _options
}

module.exports.renderAll = element => {
  if (!element) return
  if (element.properties && element.properties.id) createReference(element)

  // NOTE:
  // using `return` statement when children rendering is not wanted
  // using `break` statement when Preflight warning is not needed
  switch (element.tagName) {
    case 'defs':
      if (element.children) element.children.forEach(createReference)
      return

    case 'clipPath':
      return

    case 'g':
      inherit(element.children, element)
      break

    case 'path':
    case 'rect':
    case 'circle':
    case 'ellipse':
    case 'line':
    case 'image':
    case 'polyline':
    case 'polygon':
      if (!RENDERS.hasOwnProperty(element.tagName)) {
        Preflight.warn(`<${element.tagName}>`, Preflight.NO_RENDER)
        break
      }
      render(element, RENDERS[element.tagName]())
      break

    case undefined:
    case 'svg':
      break

    default: Preflight.warn(`<${element.tagName}>`, Preflight.NO_RENDER)
  }

  if (element.children) element.children.forEach(module.exports.renderAll)
}

module.exports.mark = markType => {
  if (!RENDERS.mark.hasOwnProperty(markType)) {
    Preflight.warn(`mark#${markType}`, Preflight.NO_RENDER)
    return
  }

  RENDERS.mark[markType](doc, options)
}

function createReference (element) {
  if (!element || !element.properties || !element.properties.id) return
  REFS[element.properties.id] = element
}

function render (el, renderCallback) {
  el = resolveInheritedProperties(el)

  el = resolvePercentageProperties(el)
  el = resolveColorProperties(el, options.colorSpace)
  el = resolveLengthProperties(el, options.userUnit)
  el = resolveTransformProperties(el, options.userUnit)
  el = resolveReferencesProperties(el, REFS)

  if (!shouldRender(el)) {
    Preflight.warn(`<${el.tagName}>`, Preflight.SKIPPED_RENDER)
    return
  }

  doc.save()

  if (el.properties['clip-path']) {
    el.properties['clip-path'].children.forEach(module.exports.renderAll)
    doc.clip()
  }

  // Call each PDFKit method matching an existing SVG property of the element
  Object.entries(el.properties).forEach(([property, value]) => {
    if (value === undefined || value === null) return
    const method = SVG_PROPERTY_TO_PDFKIT_METHOD[property]
    if (typeof doc[method] === 'function') {
      SPREADABLE_PDFKIT_METHODS.includes(method)
        ? doc[method](...value)
        : doc[method](value)
    }
  })

  // NOTE: render callbacks are designed to have the following signature:
  // optionnalRenderArguments =>
  //  (resolvedElement, doc, { destructuredOption1, destructuredOption2 }) {}
  renderCallback(el, doc, options)

  if (el.properties.stroke && el.properties.fill) doc.fillAndStroke()
  else if (el.properties.fill) doc.fill()
  else if (el.properties.stroke) doc.stroke()

  doc.restore()
}

function shouldRender (element) {
  if (element.tagName === 'image') return true

  // NOTE: <clipPath> children may be invisible (no stroke nor fill), they
  // should always be rendered anyway, as their path is still relevant for
  // clipping
  if (element.hasAncestor('clipPath')) return true

  if (!element.properties.stroke && !element.properties.fill) return false
  if (element.properties.opacity === 0) return false

  return true
}

function inherit (children, parent) {
  if (!children || !parent) return
  children.forEach(child => {
    /**
     * NOTE: Handle non-rendered → non-rendered elements inheritance by
     * merging any pre-existing inherited properties to its child, even if
     * those properties have not been resolved.
     *
     * Use case:
     *
     * <g fill=A>
     *   <child fill=↑A />
     *   <g stroke=B>
     *     <child fill=↑A stroke=↑B />
     *   </g>
     * </g>
     */
    child.properties.inherited = Object.assign({},
      parent.properties.inherited || {},
      parent.properties
    )
  })
}
