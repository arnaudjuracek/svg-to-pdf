const im = require('imagemagick')

// SEE: https://imagemagick.org/script/escape.php
const DEFAULT_SCHEMA = {
  filename: '%f',
  type: '%m',
  originalWidth: '%[width]',
  originalHeight: '%[height]',
  depth: '%[bit-depth]',
  density: '%x',
  densityUnit: '%[units]',
  colorSpace: '%[colorspace]',
  ICCProfile: '%[profile:icc]'
}

module.exports = (src, schema = DEFAULT_SCHEMA) => new Promise(resolve => {
  im.identify(['-format', JSON.stringify(schema), src], (err, output) => {
    if (err) throw err
    const o = JSON.parse(output)

    // Make sure that all numeric values are casted as such
    Object.entries(o).forEach(([k, v]) => {
      o[k] = isNaN(+v) ? v : +v
    })

    // NOTE: imagemagick output a density value in pixels per centimeter when
    // extracting from PNGs. To simplify further computation, this makes sure
    // that all extracted value of density are always expressed in PPI (pixels
    // per inches)
    // SEE: http://www.imagemagick.org/Usage/formats/#png_density
    if (o.density && o.densityUnit && o.densityUnit === 'PixelsPerCentimeter') {
      o.densityUnit = 'PixelsPerInch'
      o.density = Math.ceil(o.density * 2.54)
    }

    resolve(o)
  })
})
