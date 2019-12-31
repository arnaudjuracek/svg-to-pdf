module.exports = () => (el, { doc }) => {
  doc.rect(el.properties.x, el.properties.y, el.properties.width, el.properties.height)
}
