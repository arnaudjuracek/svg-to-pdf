const Preflight = require('../preflight')

module.exports = () => (el, doc) => {
  let href = el.properties.href

  if (!href) {
    // NOTE: as of SVG 2, xlink:href should be deprecated
    // This fallback is here for retro-comptability purpose
    href = el.properties['xlink:href']
    href && Preflight.warn('xlink:href', Preflight.DEPRECATED_FEATURE)
  }

  try {
    doc.image(href, el.properties.x || 0, el.properties.y || 0, el.properties)
  } catch (error) {
    Preflight.warn(href, Preflight.CANNOT_LOAD_FILE)
  }
}
