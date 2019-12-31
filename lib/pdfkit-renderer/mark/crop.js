const Preflight = require('../../preflight')

module.exports = (doc, { colorSpace, bleed }) => {
  if (!bleed) {
    Preflight.warn('mark#crop (no bleed area)', Preflight.SKIPPED_RENDER)
    return
  }

  const black = colorSpace === 'cmyk' ? [100, 100, 100, 100] : [0, 0, 0]

  const { width, height } = doc.page
  const w = 0.5
  const m = bleed / 4

  doc
    .lineWidth(w)
    .moveTo(0, bleed).lineTo(bleed - m, bleed)
    .moveTo(bleed, 0).lineTo(bleed, bleed - m)
    .moveTo(width, bleed).lineTo(width - (bleed - m), bleed)
    .moveTo(width - bleed, 0).lineTo(width - bleed, bleed - m)
    .moveTo(width, height - bleed).lineTo(width - (bleed - m), height - bleed)
    .moveTo(width - bleed, height).lineTo(width - bleed, height - (bleed - m))
    .moveTo(0, height - bleed).lineTo(bleed - m, height - bleed)
    .moveTo(bleed, height).lineTo(bleed, height - (bleed - m))
    .stroke(black)
}
