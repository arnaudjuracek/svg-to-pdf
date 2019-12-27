const { parse } = require('svg-parser')

// TODO: apply CSS style to each element
module.exports = svgString => {
  const svg = parse(svgString)
  implementUnistAncestor(svg)
  return svg
}

function implementUnistAncestor (element, parent = null) {
  element.parent = parent
  element.hasAncestor = function (tagName) {
    if (!this.parent) return false
    return this.parent.tagName === tagName || this.parent.hasAncestor(tagName)
  }

  if (!element.children) return
  element.children.forEach(child => implementUnistAncestor(child, element))
}
