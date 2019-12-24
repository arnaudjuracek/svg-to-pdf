const pt = require('../utils/convert-to-pdf-point')

module.exports = () => (el, doc, { userUnit }) => {
  if (!el.properties.points) return
  const points = el.properties.points
    .split(' ')
    .map(p => {
      // NOTE: as `points` attribute coordinates are always unitless,
      // assuming conversion from userUnit to point
      return p.split(',').map(v => pt(+v, userUnit))
    })

  doc.moveTo(points[0][0], points[0][1])
  for (let i = 1; i < points.length; i++) {
    doc.lineTo(points[i][0], points[i][1])
  }
}
