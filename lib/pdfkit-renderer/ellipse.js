module.exports = () => (el, doc) => {
  doc.ellipse(el.properties.cx, el.properties.cy, el.properties.rx, el.properties.ry)
}
