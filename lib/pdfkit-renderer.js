const Preflight = require('./preflight')

const resolveColorProperties = require('./svg/resolve-color')
const resolveInheritedProperties = require('./svg/resolve-inherited')
const resolveLengthProperties = require('./svg/resolve-length')
const resolvePercentageProperties = require('./svg/resolve-percentage')
const resolveTransformProperties = require('./svg/resolve-transform')
const resolveReferencesProperties = require('./svg/resolve-references')
const resolveUseProperty = require('./svg/resolve-use')

const RENDERS = {
  circle: require('./pdfkit-renderer/circle'),
  ellipse: require('./pdfkit-renderer/ellipse'),
  image: require('./pdfkit-renderer/image'),
  line: require('./pdfkit-renderer/line'),
  path: require('./pdfkit-renderer/path'),
  polygon: require('./pdfkit-renderer/polygon'),
  polyline: require('./pdfkit-renderer/polyline'),
  rect: require('./pdfkit-renderer/rect'),
  text: require('./pdfkit-renderer/text'),

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

const SVG_VALUE_TO_PDFKIT_VALUE = {
  evenodd: 'even-odd',
  nonzero: 'non-zero'
}

const SPREADABLE_PDFKIT_METHODS = ['translate', 'rotate', 'scale', 'transform']

const REFS = {}

let doc
let options

module.exports.init = (_doc, _options) => {
  doc = _doc
  options = _options
}

module.exports.renderAll = (el, { viewport } = {}) => {
  if (!el) return
  if (el.properties && el.properties.id) createReference(el)

  if (viewport) {
    doc.save()
    doc.translate(...viewport.position)
    doc.scale(...viewport.scale)
    doc.translate(...viewport.offset)
  }

  if (el.properties && el.properties.style) {
    Preflight.warn(`style=${el.properties.style}`, Preflight.UNSUPPORTED_FEATURE)
  }

  let renderChildren = true

  switch (el.tagName) {
    case 'defs':
      if (el.children) el.children.forEach(createReference)
      renderChildren = false
      break

    case 'use':
      const instance = resolveUseProperty(el, REFS, options.userUnit)
      instance && module.exports.renderAll(instance, { viewport: instance.viewport })
      renderChildren = false
      break

    case 'symbol':
    case 'clipPath':
      renderChildren = false
      break

    case 'g':
      inherit(el.children, el)
      break

    case 'circle':
    case 'ellipse':
    case 'image':
    case 'line':
    case 'path':
    case 'polygon':
    case 'polyline':
    case 'rect':
    case 'text':
      if (!RENDERS.hasOwnProperty(el.tagName)) {
        Preflight.warn(`<${el.tagName}>`, Preflight.UNSUPPORTED_FEATURE)
        break
      }
      render(el, RENDERS[el.tagName](options))
      break

    case undefined:
    case 'svg':
      break

    default: Preflight.warn(`<${el.tagName}>`, Preflight.UNSUPPORTED_FEATURE)
  }

  if (renderChildren && el.children) {
    el.children.forEach(module.exports.renderAll)
  }

  if (viewport) doc.restore()
}

module.exports.mark = markType => {
  if (!RENDERS.mark.hasOwnProperty(markType)) {
    Preflight.warn(`mark#${markType}`, Preflight.UNSUPPORTED_FEATURE)
    return
  }

  RENDERS.mark[markType](doc, options)
}

function createReference (el) {
  if (!el || !el.properties || !el.properties.id) return
  REFS[el.properties.id] = el
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

  const fillRule = SVG_VALUE_TO_PDFKIT_VALUE[el.properties['fill-rule']]
  if (el.properties.stroke && el.properties.fill) doc.fillAndStroke(undefined, undefined, fillRule)
  else if (el.properties.fill) doc.fill(fillRule)
  else if (el.properties.stroke) doc.stroke()

  doc.restore()
}

function shouldRender (el) {
  if (el.tagName === 'text') return true
  if (el.tagName === 'image') return true

  // NOTE: <clipPath> children may be invisible (no stroke nor fill), they
  // should always be rendered anyway, as their path is still relevant for
  // clipping
  if (el.hasAncestor('clipPath')) return true

  if (!el.properties.stroke && !el.properties.fill) return false
  if (el.properties.opacity === 0) return false

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
