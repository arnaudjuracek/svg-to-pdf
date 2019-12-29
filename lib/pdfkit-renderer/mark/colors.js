const Preflight = require('../../preflight')
const pt = require('../../utils/convert-to-pdf-point')

const MAX_SIZE = pt(20, 'mm')

module.exports = (doc, { colorSpace, bleed }) => {
  if (!bleed) {
    Preflight.warn('colors', Preflight.NO_BLEED_NO_MARK)
    return
  }

  // ???: colors marks for rgb color space
  if (colorSpace !== 'cmyk') return

  // ???: use all colors applied to elements
  const colors = [
    [100, 0, 0, 0],
    [0, 100, 0, 0],
    [0, 0, 100, 0],
    [0, 0, 0, 100]
  ]

  // NOTE: for simplicity's sake, length are expressed in point
  const w = 0.5
  const size = Math.min(bleed * 0.5 - w * 2, MAX_SIZE)
  let x = bleed + size
  const y = (bleed - size) / 2

  colors.forEach((color) => {
    doc
      .lineWidth(w)
      .rect(x, y, size, size)
      .fillAndStroke(color, [65, 65, 65, 65])
    x += size
  })
}
