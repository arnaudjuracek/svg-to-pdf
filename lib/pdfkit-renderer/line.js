module.exports = () => (el, doc) => {
  doc.moveTo(el.properties.x1, el.properties.y1).lineTo(el.properties.x2, el.properties.y2)
}
