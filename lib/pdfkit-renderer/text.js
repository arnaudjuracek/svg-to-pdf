const path = require('path')
const Preflight = require('../preflight')

const PDFKIT_VALUE_MAPPING = {
  // PDFKit uses canvas textBaseline as values for what is called in the SVG
  // specifications "dominant-baseline"
  // SEE: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/dominant-baseline
  // SEE: https://www.w3schools.com/tags/canvas_textbaseline.asp
  dominantBaselineToCanvasBaseline: {
    auto: 'alphabetic',
    'baseline': 'alphabetic',
    'text-bottom': 'bottom',
    alphabetic: 'alphabetic',
    ideographic: 'ideographic',
    middle: 'middle',
    central: 'middle',
    mathematical: 'alphabetic',
    hanging: 'hanging',
    'text-top': 'top'
  }
}

module.exports = ({ rootPath }) => (el, { doc }) => {
  // Raise a warning and stop rendering if element is too complex to render
  if (el.children.some(child => child.type !== 'text') || el.children.length > 1) {
    Preflight.warn(el, Preflight.UNSUPPORTED_FEATURE)
    return
  }

  // Raise a warning and stop rendering if element has no content value
  const content = el.children && el.children.find(child => child.type === 'text')
  const value = content && content.value
  if (!value) {
    Preflight.warn(`<text>undefined</text>`, Preflight.SKIPPED_RENDER)
    return
  }

  // Raise a warning and stop rendering if element has no font-size
  const fontSize = el.properties['font-size']
  if (!fontSize) {
    Preflight.warn(`<text font-size=${fontSize}>${value}</text>`, Preflight.SKIPPED_RENDER)
    return
  }
  doc.fontSize(fontSize)

  // Raise a warning and stop rendering if element has neither stroke nor fill
  const renderFill = el.properties.fill !== null
  const renderStroke = !!el.properties.stroke
  if (!renderFill && !renderStroke) {
    Preflight.warn(`<text fill=null stroke=null>${value}</text>`, Preflight.SKIPPED_RENDER)
    return
  }

  // Raise a warning and stop rendering if element has no font-family
  const fontFamily = el.properties['font-family']
  if (!fontFamily) {
    Preflight.warn(`<text font-family=${fontSize}>${value}</text>`, Preflight.SKIPPED_RENDER)
    return
  }

  // NOTE: PDFKit handles 14 standard fonts by name. This is disabled by design
  // in svg-to-pdf as they may cause issues in the pre-press process
  try {
    const fontPath = path.resolve(rootPath, fontFamily)
    doc.font(fontPath)
  } catch (error) {
    Preflight.warn(error.toString(), Preflight.SKIPPED_RENDER)
    return
  }

  const options = {
    // NOTE: PDFKit wrapped-text handling is awesome, but unfortunately it has
    // to be disabled to match the default specifications of SVG <text> element
    lineBreak: false,
    baseline: PDFKIT_VALUE_MAPPING.dominantBaselineToCanvasBaseline[el.properties['dominant-baseline'] || 'auto'],
    fill: renderFill,
    stroke: renderStroke,
    characterSpacing: el.properties['letter-spacing'],
    wordSpacing: el.properties['word-spacing']
  }

  let x = el.properties.x || 0
  let y = el.properties.y || 0
  let width = doc.widthOfString(value, options)
  let height = doc.heightOfString(value, options)

  // NOTE: PDFKit seeams to have trouble measing width of string when word or
  // character spacing are greater than 0
  if (options.wordSpacing) width += value.split(/\s/g) * options.wordSpacing
  if (options.characterSpacing) width += value.length * options.characterSpacing

  // SEE: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-anchor
  if (el.properties['text-anchor'] === 'middle') x -= width / 2
  if (el.properties['text-anchor'] === 'end') x -= width

  doc.text(value, x, y, Object.assign(options, { width, height }))
}
