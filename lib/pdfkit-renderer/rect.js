const Preflight = require('../preflight')

module.exports = () => (el, { doc }) => {
  if (!el.properties.width) {
    Preflight.warn(`<rect width=${el.properties.width}`, Preflight.SKIPPED_RENDER)
    return
  }

  if (!el.properties.height) {
    Preflight.warn(`<rect height=${el.properties.height}`, Preflight.SKIPPED_RENDER)
    return
  }

  doc.rect(el.properties.x, el.properties.y, el.properties.width, el.properties.height)
}
