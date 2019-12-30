const parseLength = require('./parse-length')

const SVG_TRANSFORM_FUNCTIONS = [
  'translate',
  'matrix',
  'rotate',
  'skewX',
  'skewY',
  'scale'
]

const REGEX = new RegExp(`(${SVG_TRANSFORM_FUNCTIONS.join('|')})\\(.*?\\)`, 'g')

module.exports = (value, userUnit) => {
  if (!value) return
  const matches = value.match(REGEX)
  if (!matches) return

  const obj = {}
  matches.forEach(match => {
    // Minor value cleanup so that it is easier to parse :
    // - remove spaces before and after
    // - remove spaces after comma
    // - remove duplicate spaces
    match = match
      .trim()
      .replace(/\s*,\s*/g, ',')
      .replace(/\s\s+/g, ' ')
    const index = match.indexOf('(')
    const v = match.substring(index + 1, match.length - 1).split(/,|\s/)
    const fn = match.substring(0, index)

    obj[fn] = {}
    switch (fn) {
      case 'translate':
        obj[fn] = [
          parseLength(v[0] || 0, userUnit),
          parseLength(v[1] || 0, userUnit)
        ]
        break
      case 'scale':
        obj[fn] = [
          +v[0] || 1,
          +v[1] || +v[0] || 1
        ]
        break
      case 'rotate':
        obj[fn] = [+v[0] || 0]
        if (v[1] && v[2]) {
          obj[fn][1] = {
            origin: [parseLength(v[1], userUnit), parseLength(v[2], userUnit)]
          }
        }
        break
      case 'skewX':
        obj[fn] = +v[0] || 0
        obj['matrix'] = skewToMatrix(obj[fn], 0)
        break
      case 'skewY':
        obj[fn] = +v[0] || 0
        obj['matrix'] = skewToMatrix(0, obj[fn])
        break
      case 'matrix':
        obj[fn] = [
          +v[0] || 0,
          +v[1] || 0,
          +v[2] || 0,
          +v[3] || 0,
          +v[4] || 0,
          +v[5] || 0
        ]
        break
    }
  })

  return obj
}

function skewToMatrix (ax, ay) {
  const skewX = Math.tan(ax * Math.PI / 180)
  const skewY = Math.tan(ay * Math.PI / 180)
  return [1, skewY, skewX, 1, 0, 0]
}
