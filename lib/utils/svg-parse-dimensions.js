const parseLength = require('./svg-parse-length')

const REGEXS = {
  root: /<svg\s([^>"']|"[^"]*"|'[^']*')*>/,
  viewbox: /\sviewBox=(['"])(.+?)\1/,
  width: /\swidth=(['"])([^%]+?)\1/,
  height: /\sheight=(['"])([^%]+?)\1/
}

module.exports = (svgString, userUnit = 'px') => {
  const root = svgString.match(REGEXS.root)
  if (root) {
    const attrs = parseAttributes(root[0], userUnit)
    if (attrs.width && attrs.height) return calculateByDimensions(attrs)
    if (attrs.viewbox) return calculateByViewbox(attrs, attrs.viewbox)
  }
  throw new TypeError('Invalid SVG')
}

function parseAttributes (root, userUnit = 'px') {
  const width = root.match(REGEXS.width)
  const height = root.match(REGEXS.height)
  const viewbox = root.match(REGEXS.viewbox)
  return {
    height: height && parseLength(height[2], userUnit),
    viewbox: viewbox && parseViewbox(viewbox[2], userUnit),
    width: width && parseLength(width[2], userUnit)
  }
}

function parseViewbox (viewbox, userUnit = 'px') {
  const bounds = viewbox.split(' ')
  return {
    height: parseLength(bounds[3], userUnit),
    width: parseLength(bounds[2], userUnit)
  }
}

function calculateByDimensions (attrs) {
  return {
    height: attrs.height,
    width: attrs.width
  }
}

function calculateByViewbox (attrs, viewbox) {
  const ratio = viewbox.width / viewbox.height
  if (attrs.width) {
    return {
      height: Math.floor(attrs.width / ratio),
      width: attrs.width
    }
  }
  if (attrs.height) {
    return {
      height: attrs.height,
      width: Math.floor(attrs.height * ratio)
    }
  }
  return {
    height: viewbox.height,
    width: viewbox.width
  }
}
