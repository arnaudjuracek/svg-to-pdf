const computeViewport = require('./compute-viewport')
const resolveReferencesProperties = require('./resolve-references')

const OVERRIDABLE_USE_SVG_PROPERTIES = [
  'width',
  'height',
  'x',
  'y',
  'href',
  'xlink:href'
]

module.exports = (el, { references, userUnit } = {}) => {
  if (el.tagName !== 'use') return
  if (!el.properties) return

  el = resolveReferencesProperties(el, references)

  const ref = el.properties.href || el.properties['xlink:href']
  if (!ref) return

  el.tagName = ref.tagName

  const props = Object.assign({}, ref.properties, el.properties)
  delete props.id
  delete props.href

  /**
  * SEE: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/use
  * Most attributes on use do not override those already on the element
  * referenced by use. (This differs from how CSS style attributes override those
  * set 'earlier' in the cascade). Only the attributes x, y, width, height and
  * href on the use element will override those set on the referenced element.
  * However, any other attributes not set on the referenced element will be
  * applied to the use element.
  */
  OVERRIDABLE_USE_SVG_PROPERTIES.forEach(prop => {
    if (ref.properties.hasOwnProperty(prop)) props[prop] = ref.properties[prop]
  })

  el.properties = props

  // NOTE: this is quite tricky and may not scale up well, but the idea is to
  // compute a viewport no matter which type the instance is (<symbol>,
  // <circle>, whatever), and nullify all viewport scaling/offseting to keep
  // only the viewport.position property.
  //
  //  That way, the <element> instance will be positioned during the viewport
  // resolution pass.
  // At date this is the best way to positioned instance: using transform can
  // override existing transformation values, and using x/y properties can
  // override existing x/y properties.
  //
  // <symbol> instances can act as new viewport and as group (with
  // inheritance). We so transform the instance tagName to <g> and associate to
  // it a viewport object so that the next render iteration will act as if it
  // was a <g> with an optional custom viewport
  el.viewport = computeViewport(el, userUnit)
  if (el.tagName !== 'symbol') {
    el.viewport.scale = [1, 1]
    el.viewport.offset = [0, 0]
  } else el.tagName = 'g'

  return el
}
