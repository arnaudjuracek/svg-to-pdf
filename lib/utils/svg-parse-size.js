const parseLength = require('./svg-parse-length')

const svgReg = /<svg\s([^>"']|"[^"]*"|'[^']*')*>/

const extractorRegExps = {
  root: svgReg,
  viewbox: /\sviewBox=(['"])(.+?)\1/,
  width: /\swidth=(['"])([^%]+?)\1/,
  height: /\sheight=(['"])([^%]+?)\1/
}

function parseViewbox (viewbox) {
  const bounds = viewbox.split(' ')
  return {
    height: parseLength(bounds[3]),
    width: parseLength(bounds[2])
  }
}

function parseAttributes (root) {
  const width = root.match(extractorRegExps.width)
  const height = root.match(extractorRegExps.height)
  const viewbox = root.match(extractorRegExps.viewbox)
  return {
    height: height && parseLength(height[2]),
    viewbox: viewbox && parseViewbox(viewbox[2]),
    width: width && parseLength(width[2])
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

module.exports = {
  validate (buffer) {
    const str = String(buffer)
    return svgReg.test(str)
  },

  calculate (buffer) {
    const root = buffer.toString('utf8').match(extractorRegExps.root)
    if (root) {
      const attrs = parseAttributes(root[0])
      if (attrs.width && attrs.height) return calculateByDimensions(attrs)
      if (attrs.viewbox) return calculateByViewbox(attrs, attrs.viewbox)
    }
    throw new TypeError('Invalid SVG')
  }
}
