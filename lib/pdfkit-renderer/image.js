const path = require('path')
const isBase64 = require('is-base64')
const Preflight = require('../preflight')

module.exports = ({ rootPath }) => (el, { doc }) => {
  // NOTE: as of SVG 2, xlink:href should be deprecated
  // This fallback is here for retro-comptability purpose
  const href = el.properties.href || el.properties['xlink:href']

  try {
    const b64 = isBase64(href, { allowMime: true })
    const src = b64 ? href : path.resolve(rootPath, href)

    Preflight.registerImage(src, el.properties, b64)
    doc.image(src, el.properties.x || 0, el.properties.y || 0, el.properties)
  } catch (error) {
    Preflight.warn(`href=${href}`, Preflight.CANNOT_LOAD_FILE)
  }
}
