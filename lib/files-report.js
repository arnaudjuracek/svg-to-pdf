// TODO: handle font files

const pt = require('./utils/convert-to-pdf-point')
const extractImageInformation = require('./utils/extract-image-information')

const queue = []
module.exports.queue = (src, properties) => queue.push({ src, properties })
module.exports.queueMessage = message => queue.push({ message })

module.exports.run = () => Promise.all(queue.map(async item => {
  if (item.message) return item.message

  const extracted = await extractImageInformation(item.src)

  const { width, height } = item.properties
  const originalWidth = pt(+extracted.originalHeight, 'px')
  const originalHeight = pt(+extracted.originalHeight, 'px')

  const scale = [
    width ? width / originalWidth : 1,
    height ? height / originalHeight : 1
  ]

  if (!width) scale[0] = scale[1]
  if (!height) scale[1] = scale[0]

  const actualPPI = +extracted.density

  return {
    filename: extracted.filename,
    type: extracted.type,
    actualPPI,
    effectivePPI: scale[0] === scale[1]
      ? Math.floor(actualPPI * (1 / scale[0]))
      : [Math.floor(actualPPI * (1 / scale[0])), Math.floor(actualPPI * (1 / scale[1]))],
    ICCProfile: extracted.ICCProfile,
    colorSpace: extracted.colorSpace
  }
}))
