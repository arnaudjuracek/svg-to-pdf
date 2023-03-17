const path = require('path')
const isBase64 = require('is-base64')
const Preflight = require('../preflight')
const parsePreserveAspectRatio = require('../svg/parse-preserve-aspect-ratio')

module.exports = ({ rootPath }) => (el, { doc }) => {
  // NOTE: as of SVG 2, xlink:href should be deprecated
  // This fallback is here for retro-comptability purpose
  const href = el.properties.href || el.properties['xlink:href'] || el.properties['data-href']

  try {
    const b64 = isBase64(href, { allowMime: true })
    const src = b64 ? href : path.resolve(rootPath, href)
    Preflight.registerImage(src, el.properties, b64)

    const x = el.properties.x || 0
    const y = el.properties.y || 0
    const width = el.properties.width
    const height = el.properties.height
    const options = {}

    const aspectRatio = parsePreserveAspectRatio(el.properties.preserveAspectRatio)
    if (aspectRatio && !aspectRatio.ignored && width && height) {
      if (aspectRatio.fit) options.fit = [width, height]
      if (aspectRatio.cover) {
        options.cover = [width, height]
      }
      options.align = aspectRatio.align
      options.valign = aspectRatio.valign
    } else {
      options.width = width
      options.height = height
    }

    // PDFKit does not hide the overflow using the cover option
    // SEE https://github.com/foliojs/pdfkit/issues/1044
    if (options.cover) {
      doc.save()
      doc.rect(x, y, ...options.cover).clip()
    }

    doc.image(src, x, y, options)
    if (options.cover) doc.restore()
  } catch (error) {
    Preflight.warn(`href=${href}`, Preflight.CANNOT_LOAD_FILE)
  }
}
