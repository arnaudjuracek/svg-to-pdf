const fs = require('fs-extra')
const path = require('path')
const SVG2PDF = require('..')

const argv = require('minimist')(process.argv.slice(2), {
  alias: { i: 'input', o: 'output' },
  default: {
    'argv': 10,
    'user-unit': 'mm',
    'color-space': 'cmyk',
    input: path.join(__dirname, 'sample.svg'),
    output: undefined
  }
})

const options = {
  colorSpace: argv['color-space'],
  userUnit: argv['user-unit'],
  bleed: argv['bleed'],
  docPath: argv.output,
  rootPath: __dirname
}

;(async () => {
  try {
    const svgString = await fs.readFile(argv.input, 'utf8')
    const { docPath, warnings, files } = await SVG2PDF(svgString, options)

    files && console.log('Files report', '\n', files, '\n')

    Object.entries(warnings).forEach(([flag, messages]) => {
      console.log('⚠  Warning:', flag)
      console.log(messages)
      console.log('')
    })

    console.log('✔  Success:', docPath)
  } catch (err) {
    console.error(err instanceof Error ? err : Error(err))
    process.exit(1)
  }
})()
