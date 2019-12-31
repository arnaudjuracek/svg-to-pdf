const Preflight = require('../../preflight')
const pt = require('../../utils/convert-to-pdf-point')

const MAX_RADIUS = pt(10, 'mm')

module.exports = (doc, { colorSpace, bleed }) => {
  if (!bleed) {
    Preflight.warn('mark#registration (no bleed area)', Preflight.SKIPPED_RENDER)
    return
  }

  const black = colorSpace === 'cmyk' ? [100, 100, 100, 100] : [0, 0, 0]
  const paper = colorSpace === 'cmyk' ? [0, 0, 0, 0] : [255, 255, 255]

  // NOTE: for simplicity's sake, length are expressed in point
  const w = 0.5
  const c = bleed / 2
  const r1 = Math.min(bleed / 4, MAX_RADIUS)
  const r2 = r1 * 0.6
  const r3 = r1 * 1.2

  const { width, height } = doc.page

  mark(width / 2, c)
  mark(width - c, height / 2)
  mark(width / 2, height - c)
  mark(c, doc.page.height / 2)

  function mark (x, y) {
    doc
      .lineWidth(w)
      .circle(x, y, r1 - w * 2)
      .moveTo(x - r3, y)
      .lineTo(x + r3, y)
      .moveTo(x, y - r3)
      .lineTo(x, y + r3)
      .stroke(black)
      .circle(x, y, r2)
      .fill(black)
      .moveTo(x - r2, y)
      .lineTo(x + r2, y)
      .moveTo(x, y - r2)
      .lineTo(x, y + r2)
      .stroke(paper)
  }
}
