module.exports = (doc, { colorSpace, bleed }) => {
  // TODO: warn if no bleed
  if (!bleed) return

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
  const size = bleed * 0.5 - w * 2
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
