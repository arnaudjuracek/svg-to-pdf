module.exports = () => (el, { doc }) => {
  doc.circle(el.properties.cx, el.properties.cy, el.properties.r)
}
