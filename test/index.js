const SVG2PDF = require('..')
const path = require('path')
const fs = require('fs-extra')
const args = process.argv.slice(2)

const svgPath = args[0]
  ? path.resolve(process.cwd(), args[0])
  : path.join(__dirname, 'sample.svg')

;(async function () {
  try {
    const svgString = await fs.readFile(svgPath, 'utf8')
    console.log(svgString)
    // TODO: handdle returning object like { result, warnings, etc… }
    SVG2PDF(svgString)
  } catch (err) {
    console.error(err instanceof Error ? err : Error(err))
    process.exit(1)
  }
})()
